import { useState, useCallback } from 'react';
import { Conversation } from '@/types/conversation';
import { AppStorage } from '@/utils/storage';

export function useConversationStore() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AppStorage.getItem<Conversation[]>('conversations');
      if (stored) {
        setConversations(stored.map(conv => ({
          ...conv,
          updatedAt: new Date(conv.updatedAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConversation = useCallback(async (conversation: Conversation) => {
    try {
      const updated = [...conversations];
      const existingIndex = updated.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = conversation;
      } else {
        updated.unshift(conversation);
      }
      
      setConversations(updated);
      await AppStorage.setItem('conversations', updated);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [conversations]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      await AppStorage.setItem('conversations', updated);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [conversations]);

  return {
    conversations,
    isLoading,
    loadConversations,
    saveConversation,
    deleteConversation,
  };
}