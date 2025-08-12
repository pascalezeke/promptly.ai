import { useState, useCallback, useEffect } from 'react';
import { AppStorage, SecureStorage } from '@/utils/storage';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartAI: boolean;
  overlayOpacity: number;
  suggestionCount: number;
  apiKeyConfigured: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  voiceEnabled: true,
  notificationsEnabled: true,
  autoStartAI: false,
  overlayOpacity: 0.9,
  suggestionCount: 3,
  apiKeyConfigured: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AppStorage.getItem<AppSettings>('app_settings');
      const apiKey = await SecureStorage.getItem('gemini_api_key');
      
      if (stored) {
        setSettings({
          ...stored,
          apiKeyConfigured: !!apiKey,
        });
      } else {
        // Set default API key if not configured
        if (!apiKey) {
          await SecureStorage.setItem('gemini_api_key', 'AIzaSyDijdk9YnQqA7PexrRrHxf5g1moheu7JjU');
        }
        setSettings({
          ...defaultSettings,
          apiKeyConfigured: true,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await AppStorage.setItem('app_settings', updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }, [settings]);

  const setApiKey = useCallback(async (apiKey: string) => {
    try {
      await SecureStorage.setItem('gemini_api_key', apiKey);
      await updateSetting('apiKeyConfigured', true);
    } catch (error) {
      console.error('Failed to set API key:', error);
    }
  }, [updateSetting]);

  const getApiKey = useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStorage.getItem('gemini_api_key');
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    updateSetting,
    setApiKey,
    getApiKey,
    loadSettings,
  };
}