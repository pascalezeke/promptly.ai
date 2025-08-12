import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageSquare, Trash2, Share } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Conversation } from '@/types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  onDelete: () => void;
}

export function ConversationItem({ conversation, onDelete }: ConversationItemProps) {
  const { theme } = useTheme();

  const handleShare = () => {
    console.log('Sharing conversation:', conversation.id);
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageSquare size={20} color={theme.colors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {conversation.lastMessage}
          </Text>
          <Text style={styles.timestamp}>
            {conversation.updatedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share size={16} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  preview: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});