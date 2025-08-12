export interface AIRequest {
    message: string;
    conversationId?: string;
    context?: any[];
  }
  
  export interface AIResponse {
    text: string;
    confidence: number;
    conversationId: string;
    metadata: {
      model: string;
      processingTime: number;
      tokens: number;
    };
  }
  
  export class HeyBlueAIService {
    private apiKey: string;
    private baseUrl: string = 'https://api.heyblue.ai';
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  
    async sendMessage(request: AIRequest): Promise<AIResponse> {
      try {
        // Simulate API call to Hey Blue AI
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        return {
          text: `AI Response: ${request.message}. This is a simulated response that would normally come from Hey Blue AI's advanced language model.`,
          confidence: 0.95,
          conversationId: request.conversationId || 'new-conversation',
          metadata: {
            model: 'hey-blue-gpt-4',
            processingTime: 1200,
            tokens: 150,
          },
        };
      } catch (error) {
        throw new Error(`Hey Blue AI request failed: ${error}`);
      }
    }
  
    async streamMessage(
      request: AIRequest,
      onChunk: (chunk: string) => void
    ): Promise<void> {
      // Simulate streaming response
      const response = await this.sendMessage(request);
      const words = response.text.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onChunk(words.slice(0, i + 1).join(' '));
      }
    }
  
    async analyzeImage(imageUri: string, prompt?: string): Promise<AIResponse> {
      // Simulate image analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      return {
        text: `Image Analysis: I can see this is an image. ${prompt ? `Regarding your question: "${prompt}", ` : ''}This would normally be analyzed by Hey Blue AI's vision capabilities.`,
        confidence: 0.88,
        conversationId: 'image-analysis',
        metadata: {
          model: 'hey-blue-vision',
          processingTime: 2000,
          tokens: 200,
        },
      };
    }
  }