import { useState, useEffect, useCallback } from 'react';
import { sessionManager } from '@/services/SessionManager';
import { geminiAIService } from '@/services/GeminiAIService';
import { useSettings } from './useSettings';

interface AISessionState {
  isActive: boolean;
  isInitialized: boolean;
  overlayActive: boolean;
  accessibilityActive: boolean;
  sttActive: boolean;
  suggestions: string[];
}

export function useAISession() {
  const { getApiKey } = useSettings();
  const [sessionState, setSessionState] = useState<AISessionState>({
    isActive: false,
    isInitialized: false,
    overlayActive: false,
    accessibilityActive: false,
    sttActive: false,
    suggestions: [],
  });

  const initializeAI = useCallback(async () => {
    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        console.error('No API key found');
        return false;
      }

      const initialized = await geminiAIService.initialize(apiKey);
      if (initialized) {
        await sessionManager.initializeServices();
        setSessionState(prev => ({ ...prev, isInitialized: true }));
      }
      return initialized;
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      return false;
    }
  }, [getApiKey]);

  const startAISession = useCallback(async () => {
    if (!sessionState.isInitialized) {
      const initialized = await initializeAI();
      if (!initialized) return false;
    }

    const success = await sessionManager.startAISession();
    return success;
  }, [sessionState.isInitialized, initializeAI]);

  const stopAISession = useCallback(async () => {
    return await sessionManager.stopAISession();
  }, []);

  const toggleAISession = useCallback(async () => {
    if (sessionState.isActive) {
      return await stopAISession();
    } else {
      return await startAISession();
    }
  }, [sessionState.isActive, startAISession, stopAISession]);

  const generateSuggestions = useCallback(async (text: string, context: 'message' | 'call' | 'general' = 'general') => {
    if (!sessionState.isInitialized) return [];

    try {
      const suggestions = await geminiAIService.generateSuggestions(text, context);
      const suggestionTexts = suggestions.map(s => s.text);
      setSessionState(prev => ({ ...prev, suggestions: suggestionTexts }));
      return suggestionTexts;
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }, [sessionState.isInitialized]);

  useEffect(() => {
    const handleSessionStateChange = (state: any) => {
      setSessionState(prev => ({
        ...prev,
        isActive: state.isActive,
        overlayActive: state.overlayActive,
        accessibilityActive: state.accessibilityActive,
        sttActive: state.sttActive,
      }));
    };

    sessionManager.addSessionCallback(handleSessionStateChange);
    
    // Initialize AI on mount
    initializeAI();

    return () => {
      sessionManager.removeSessionCallback(handleSessionStateChange);
    };
  }, [initializeAI]);

  return {
    sessionState,
    startAISession,
    stopAISession,
    toggleAISession,
    generateSuggestions,
    initializeAI,
  };
}