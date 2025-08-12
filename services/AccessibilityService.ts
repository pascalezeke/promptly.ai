import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface AccessibilityModule {
  startAccessibilityService(): Promise<boolean>;
  stopAccessibilityService(): Promise<boolean>;
  isAccessibilityServiceEnabled(): Promise<boolean>;
  requestAccessibilityPermission(): Promise<boolean>;
  getVisibleText(): Promise<string>;
}

class AccessibilityService {
  private accessibilityModule: AccessibilityModule | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private isActive = false;
  private textDetectionCallback: ((text: string) => void) | null = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.accessibilityModule = NativeModules.AccessibilityService;
      if (this.accessibilityModule) {
        this.eventEmitter = new NativeEventEmitter(this.accessibilityModule as any);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.accessibilityModule) return false;

    try {
      return await this.accessibilityModule.requestAccessibilityPermission();
    } catch (error) {
      console.error('Accessibility permission request failed:', error);
      return false;
    }
  }

  async isEnabled(): Promise<boolean> {
    if (!this.accessibilityModule) return false;

    try {
      return await this.accessibilityModule.isAccessibilityServiceEnabled();
    } catch (error) {
      console.error('Failed to check accessibility service status:', error);
      return false;
    }
  }

  async startService(): Promise<boolean> {
    if (!this.accessibilityModule || this.isActive) return false;

    try {
      const success = await this.accessibilityModule.startAccessibilityService();
      if (success) {
        this.isActive = true;
        this.setupEventListeners();
      }
      return success;
    } catch (error) {
      console.error('Failed to start accessibility service:', error);
      return false;
    }
  }

  async stopService(): Promise<boolean> {
    if (!this.accessibilityModule || !this.isActive) return false;

    try {
      const success = await this.accessibilityModule.stopAccessibilityService();
      if (success) {
        this.isActive = false;
        this.removeEventListeners();
      }
      return success;
    } catch (error) {
      console.error('Failed to stop accessibility service:', error);
      return false;
    }
  }

  setTextDetectionCallback(callback: (text: string) => void): void {
    this.textDetectionCallback = callback;
  }

  async getVisibleText(): Promise<string> {
    if (!this.accessibilityModule) return '';

    try {
      return await this.accessibilityModule.getVisibleText();
    } catch (error) {
      console.error('Failed to get visible text:', error);
      return '';
    }
  }

  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('onTextDetected', (text: string) => {
      if (this.textDetectionCallback && text.trim()) {
        this.textDetectionCallback(text);
      }
    });

    this.eventEmitter.addListener('onAppChanged', (packageName: string) => {
      console.log('App changed to:', packageName);
      // Handle app change if needed
    });
  }

  private removeEventListeners(): void {
    if (!this.eventEmitter) return;
    this.eventEmitter.removeAllListeners('onTextDetected');
    this.eventEmitter.removeAllListeners('onAppChanged');
  }

  isServiceActive(): boolean {
    return this.isActive;
  }
}

export const accessibilityService = new AccessibilityService();