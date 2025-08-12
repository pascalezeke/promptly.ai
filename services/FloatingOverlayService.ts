import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';

interface FloatingOverlayModule {
  startOverlay(): Promise<boolean>;
  stopOverlay(): Promise<boolean>;
  updateOverlayContent(content: string[]): Promise<void>;
  isOverlayActive(): Promise<boolean>;
  requestOverlayPermission(): Promise<boolean>;
}

class FloatingOverlayService {
  private overlayModule: FloatingOverlayModule | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private isActive = false;

  constructor() {
    if (Platform.OS === 'android') {
      this.overlayModule = NativeModules.FloatingOverlay;
      if (this.overlayModule) {
        this.eventEmitter = new NativeEventEmitter(this.overlayModule as any);
      }
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      // Request SYSTEM_ALERT_WINDOW permission
      const overlayPermission = await this.overlayModule?.requestOverlayPermission();
      
      // Request other permissions
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      return overlayPermission && 
             permissions[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted' &&
             permissions[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startOverlay(): Promise<boolean> {
    if (!this.overlayModule || this.isActive) return false;

    try {
      const success = await this.overlayModule.startOverlay();
      if (success) {
        this.isActive = true;
        this.setupEventListeners();
      }
      return success;
    } catch (error) {
      console.error('Failed to start overlay:', error);
      return false;
    }
  }

  async stopOverlay(): Promise<boolean> {
    if (!this.overlayModule || !this.isActive) return false;

    try {
      const success = await this.overlayModule.stopOverlay();
      if (success) {
        this.isActive = false;
        this.removeEventListeners();
      }
      return success;
    } catch (error) {
      console.error('Failed to stop overlay:', error);
      return false;
    }
  }

  async updateSuggestions(suggestions: string[]): Promise<void> {
    if (!this.overlayModule || !this.isActive) return;

    try {
      await this.overlayModule.updateOverlayContent(suggestions);
    } catch (error) {
      console.error('Failed to update suggestions:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('onSuggestionClicked', (suggestion: string) => {
      this.onSuggestionClicked(suggestion);
    });

    this.eventEmitter.addListener('onToggleClicked', (isActive: boolean) => {
      this.onToggleClicked(isActive);
    });
  }

  private removeEventListeners(): void {
    if (!this.eventEmitter) return;
    this.eventEmitter.removeAllListeners('onSuggestionClicked');
    this.eventEmitter.removeAllListeners('onToggleClicked');
  }

  private onSuggestionClicked(suggestion: string): void {
    // Copy to clipboard functionality would be implemented here
    console.log('Suggestion clicked:', suggestion);
  }

  private onToggleClicked(isActive: boolean): void {
    if (isActive) {
      this.startAISession();
    } else {
      this.stopAISession();
    }
  }

  private async startAISession(): Promise<void> {
    // Start all AI services
    console.log('Starting AI session...');
  }

  private async stopAISession(): Promise<void> {
    // Stop all AI services
    console.log('Stopping AI session...');
  }

  isOverlayActive(): boolean {
    return this.isActive;
  }
}

export const floatingOverlayService = new FloatingOverlayService();