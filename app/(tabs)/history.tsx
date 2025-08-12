import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { History } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useConversationStore } from '@/hooks/useConversationStore';
import { ConversationItem } from '@/components/ConversationItem';
import { EmptyState } from '@/components/EmptyState';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { conversations, isLoading, loadConversations, deleteConversation } = useConversationStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleRefresh = () => {
    loadConversations();
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat History</Text>
        <Text style={styles.subtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon={History}
          title="No conversations yet"
          subtitle="Your chat history will appear here once you start conversations with the AI"
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onDelete={() => handleDeleteConversation(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});