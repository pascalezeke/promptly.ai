export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    type?: 'text' | 'image' | 'voice' | 'file';
    metadata?: {
      imageUrl?: string;
      audioUrl?: string;
      fileUrl?: string;
      fileName?: string;
    };
  }
  
  export interface ChatSession {
    id: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    title: string;
  }
  
  export interface AIResponse {
    text: string;
    confidence: number;
    model: string;
    processingTime: number;
  }