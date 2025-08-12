import { floatingOverlayService } from './FloatingOverlayService';
import { accessibilityService } from './AccessibilityService';
import { speechToTextService } from './SpeechToTextService';
import { geminiAIService } from './GeminiAIService';
import { AppStorage } from '@/utils/storage';

interface SessionState {
  isActive: boolean;
  overlayActive: boolean;
  accessibilityActive: boolean;
  sttActive: boolean;
  aiInitialized: boolean;
}

class SessionManager {
  private sessionState: SessionState = {
    isActive: false,
    overlayActive: false,
    accessibilityActive: false,
    sttActive: false,
    aiInitialized: false,
  };

  private sessionCallbacks: ((state: SessionState) => void)[] = [];

  async initializeServices(): Promise<boolean> {
    try {
      // Initialize AI service
      const apiKey = await AppStorage.getItem<string>('gemini_api_key');
      if (apiKey) {
        const aiInitialized = await geminiAIService.initialize(apiKey);
        this.sessionState.aiInitialized = aiInitialized;
      }

      // Initialize STT service
      await speechToTextService.initialize();

      // Set up callbacks
      this.setupServiceCallbacks();

      return true;
    } catch (error) {
      console.error('Failed to initialize services:', error);
      return false;
    }
  }

  async startAISession(): Promise<boolean> {
    if (this.sessionState.isActive) return true;

    try {
      console.log('Starting AI session...');

      // Start overlay service
      const overlayStarted = await floatingOverlayService.startOverlay();
      this.sessionState.overlayActive = overlayStarted;

      // Start accessibility service
      const accessibilityStarted = await accessibilityService.startService();
      this.sessionState.accessibilityActive = accessibilityStarted;

      // Start speech-to-text service
      const sttStarted = await speechToTextService.startListening();
      this.sessionState.sttActive = sttStarted;

      this.sessionState.isActive = overlayStarted && accessibilityStarted && sttStarted;

      if (this.sessionState.isActive) {
        await this.updateOverlaySuggestions(['AI Assistant Active', 'Listening...', 'Ready to help']);
      }

      this.notifyStateChange();
      return this.sessionState.isActive;
    } catch (error) {
      console.error('Failed to start AI session:', error);
      return false;
    }
  }

  async stopAISession(): Promise<boolean> {
    if (!this.sessionState.isActive) return true;

    try {
      console.log('Stopping AI session...');

      // Stop all services
      await Promise.all([
        floatingOverlayService.stopOverlay(),
        accessibilityService.stopService(),
        speechToTextService.stopListening(),
      ]);

      this.sessionState = {
        ...this.sessionState,
        isActive: false,
        overlayActive: false,
        accessibilityActive: false,
        sttActive: false,
      };

      this.notifyStateChange();
      return true;
    } catch (error) {
      console.error('Failed to stop AI session:', error);
      return false;
    }
  }

  async toggleAISession(): Promise<boolean> {
    if (this.sessionState.isActive) {
      return await this.stopAISession();
    } else {
      return await this.startAISession();
    }
  }

  private setupServiceCallbacks(): void {
    // Handle text detection from accessibility service
    accessibilityService.setTextDetectionCallback(async (text: string) => {
      if (this.sessionState.isActive && this.sessionState.aiInitialized) {
        await this.processTextInput(text, 'message');
      }
    });

    // Handle speech transcription
    speechToTextService.setTranscriptionCallback(async (text: string) => {
      if (this.sessionState.isActive && this.sessionState.aiInitialized) {
        await this.processTextInput(text, 'call');
      }
    });
  }

  private async processTextInput(text: string, context: 'message' | 'call'): Promise<void> {
    try {
      const suggestions = await geminiAIService.generateSuggestions(text, context);
      const suggestionTexts = suggestions.map(s => s.text);
      
      if (suggestionTexts.length > 0) {
        await this.updateOverlaySuggestions(suggestionTexts);
      }
    } catch (error) {
      console.error('Failed to process text input:', error);
    }
  }

  private async updateOverlaySuggestions(suggestions: string[]): Promise<void> {
    if (this.sessionState.overlayActive) {
      await floatingOverlayService.updateSuggestions(suggestions);
    }
  }

  addSessionCallback(callback: (state: SessionState) => void): void {
    this.sessionCallbacks.push(callback);
  }

  removeSessionCallback(callback: (state: SessionState) => void): void {
    const index = this.sessionCallbacks.indexOf(callback);
    if (index > -1) {
      this.sessionCallbacks.splice(index, 1);
    }
  }

  private notifyStateChange(): void {
    this.sessionCallbacks.forEach(callback => {
      try {
        callback({ ...this.sessionState });
      } catch (error) {
        console.error('Session callback error:', error);
      }
    });
  }

  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  async requestAllPermissions(): Promise<boolean> {
    try {
      const overlayPermission = await floatingOverlayService.requestPermissions();
      const accessibilityPermission = await accessibilityService.requestPermission();
      
      return overlayPermission && accessibilityPermission;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }
}

export const sessionManager = new SessionManager();