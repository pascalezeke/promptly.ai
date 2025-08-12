import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/hooks/useChatStore';
import { ChatMessage } from '@/components/ChatMessage';
import { TypingIndicator } from '@/components/TypingIndicator';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { FloatingToggleButton } from '@/components/FloatingToggleButton';
import { EmptyState } from '@/components/EmptyState';
import { MessageCircle } from 'lucide-react-native';

export default function ChatScreen() {
  const { theme } = useTheme();
  const { currentSession, isLoading, sendMessage, createNewSession } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');
    
    if (!currentSession) {
      createNewSession();
    }
    
    await sendMessage(message);
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNewChat = () => {
    createNewSession();
    setShowActionMenu(false);
  };

  const styles = createStyles(theme);

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Promptly AI</Text>
          <Text style={styles.subtitle}>Your intelligent assistant</Text>
        </View>

        <EmptyState
          icon={MessageCircle}
          title="Start a conversation"
          subtitle="Ask me anything or tap the button below to begin chatting with AI"
        />

        <View style={styles.emptyActions}>
          <TouchableOpacity style={styles.startButton} onPress={createNewSession}>
            <Text style={styles.startButtonText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>

        <FloatingToggleButton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Promptly AI</Text>
        <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
          <Plus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={currentSession.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && <TypingIndicator />}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <FloatingActionMenu
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
      />

      <FloatingToggleButton />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.onBackground,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    maxHeight: 100,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  emptyActions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});