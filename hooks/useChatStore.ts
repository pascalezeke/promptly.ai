import { useState, useCallback } from 'react';
import { Message, ChatSession } from '@/types/chat';
import { geminiAIService } from '@/services/GeminiAIService';

export function useChatStore() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'New Chat',
    };
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!currentSession) {
      createNewSession();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date(),
        title: prev.messages.length === 0 ? text.slice(0, 30) + '...' : prev.title,
      };
    });

    setIsLoading(true);

    try {
      const suggestions = await geminiAIService.generateSuggestions(text, 'general');
      const aiResponse = suggestions.length > 0 
        ? suggestions[0].text 
        : 'I understand your message. How can I help you further?';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date(),
        };
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: new Date(),
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, createNewSession]);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  return {
    currentSession,
    isLoading,
    sendMessage,
    createNewSession,
    clearSession,
  };
}