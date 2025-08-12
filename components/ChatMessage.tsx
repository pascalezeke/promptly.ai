import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Copy, User, Bot } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { theme } = useTheme();

  const handleCopy = () => {
    // Implement copy functionality
    console.log('Copying message:', message.text);
  };

  const styles = createStyles(theme, message.isUser);

  return (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.container}>
      <View style={styles.messageContainer}>
        <View style={styles.avatarContainer}>
          {message.isUser ? (
            <User size={16} color={theme.colors.onPrimary} />
          ) : (
            <Bot size={16} color={theme.colors.onSecondary} />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message.text}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                <Copy size={12} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: any, isUser: boolean) => StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  messageContainer: {
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isUser ? theme.colors.primary : theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    maxWidth: '80%',
  },
  messageBubble: {
    backgroundColor: isUser ? theme.colors.primaryContainer : theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    borderBottomRightRadius: isUser ? 4 : 16,
    borderBottomLeftRadius: isUser ? 16 : 4,
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  messageText: {
    fontSize: 16,
    color: isUser ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  copyButton: {
    padding: 4,
  },
});