import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface VoskSTTModule {
  initializeVosk(modelPath: string): Promise<boolean>;
  startListening(): Promise<boolean>;
  stopListening(): Promise<boolean>;
  isListening(): Promise<boolean>;
  downloadModel(): Promise<boolean>;
  isModelDownloaded(): Promise<boolean>;
}

class SpeechToTextService {
  private voskModule: VoskSTTModule | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private isListening = false;
  private isInitialized = false;
  private transcriptionCallback: ((text: string) => void) | null = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.voskModule = NativeModules.VoskSTT;
      if (this.voskModule) {
        this.eventEmitter = new NativeEventEmitter(this.voskModule as any);
      }
    }
  }

  async initialize(): Promise<boolean> {
    if (!this.voskModule || this.isInitialized) return this.isInitialized;

    try {
      // Check if model is downloaded
      const isModelDownloaded = await this.voskModule.isModelDownloaded();
      
      if (!isModelDownloaded) {
        console.log('Downloading VOSK model...');
        const downloadSuccess = await this.voskModule.downloadModel();
        if (!downloadSuccess) {
          console.error('Failed to download VOSK model');
          return false;
        }
      }

      // Initialize VOSK with model
      const success = await this.voskModule.initializeVosk('vosk-model-small-en-us-0.15');
      if (success) {
        this.isInitialized = true;
        this.setupEventListeners();
      }
      return success;
    } catch (error) {
      console.error('Failed to initialize VOSK:', error);
      return false;
    }
  }

  async startListening(): Promise<boolean> {
    if (!this.voskModule || !this.isInitialized || this.isListening) return false;

    try {
      const success = await this.voskModule.startListening();
      if (success) {
        this.isListening = true;
      }
      return success;
    } catch (error) {
      console.error('Failed to start listening:', error);
      return false;
    }
  }

  async stopListening(): Promise<boolean> {
    if (!this.voskModule || !this.isListening) return false;

    try {
      const success = await this.voskModule.stopListening();
      if (success) {
        this.isListening = false;
      }
      return success;
    } catch (error) {
      console.error('Failed to stop listening:', error);
      return false;
    }
  }

  setTranscriptionCallback(callback: (text: string) => void): void {
    this.transcriptionCallback = callback;
  }

  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('onPartialResult', (text: string) => {
      // Handle partial transcription results
      console.log('Partial result:', text);
    });

    this.eventEmitter.addListener('onFinalResult', (text: string) => {
      if (this.transcriptionCallback && text.trim()) {
        this.transcriptionCallback(text);
      }
    });

    this.eventEmitter.addListener('onError', (error: string) => {
      console.error('STT Error:', error);
    });
  }

  private removeEventListeners(): void {
    if (!this.eventEmitter) return;
    this.eventEmitter.removeAllListeners('onPartialResult');
    this.eventEmitter.removeAllListeners('onFinalResult');
    this.eventEmitter.removeAllListeners('onError');
  }

  isServiceListening(): boolean {
    return this.isListening;
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const speechToTextService = new SpeechToTextService();