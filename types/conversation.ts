export interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    updatedAt: Date;
    tags?: string[];
    category?: string;
  }
  
  export interface ConversationFilter {
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
    category?: string;
  }