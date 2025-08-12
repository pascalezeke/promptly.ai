import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface AISuggestion {
  text: string;
  confidence: number;
  category: 'reply' | 'action' | 'question';
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private apiKey: string | null = null;
  private isInitialized = false;

  async initialize(apiKey: string): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return false;
    }
  }

  async generateSuggestions(
    inputText: string,
    context: 'message' | 'call' | 'general' = 'general'
  ): Promise<AISuggestion[]> {
    if (!this.model || !this.isInitialized) {
      console.error('Gemini AI not initialized');
      return [];
    }

    try {
      const prompt = this.buildPrompt(inputText, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseSuggestions(text);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  private buildPrompt(inputText: string, context: string): string {
    const contextPrompts = {
      message: `You are helping someone respond to a message. The message they received is: "${inputText}". Generate 3 short, appropriate reply suggestions (max 10 words each). Format as: 1. [reply] 2. [reply] 3. [reply]`,
      call: `You are helping someone during a phone call. They heard: "${inputText}". Generate 3 short response suggestions (max 8 words each). Format as: 1. [response] 2. [response] 3. [response]`,
      general: `Generate 3 short, helpful response suggestions for: "${inputText}". Keep each under 10 words. Format as: 1. [suggestion] 2. [suggestion] 3. [suggestion]`
    };

    return contextPrompts[context] || contextPrompts.general;
  }

  private parseSuggestions(response: string): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    try {
      // Parse numbered list format
      const lines = response.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match && suggestions.length < 3) {
          const text = match[1].trim();
          if (text.length > 0 && text.length <= 50) { // Reasonable length limit
            suggestions.push({
              text,
              confidence: 0.8,
              category: this.categorizeResponse(text)
            });
          }
        }
      }

      // Fallback: split by periods or semicolons if numbered format fails
      if (suggestions.length === 0) {
        const parts = response.split(/[.;]/).filter(part => part.trim());
        for (let i = 0; i < Math.min(3, parts.length); i++) {
          const text = parts[i].trim();
          if (text.length > 0 && text.length <= 50) {
            suggestions.push({
              text,
              confidence: 0.7,
              category: this.categorizeResponse(text)
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse suggestions:', error);
    }

    return suggestions.slice(0, 3); // Ensure max 3 suggestions
  }

  private categorizeResponse(text: string): 'reply' | 'action' | 'question' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('?')) return 'question';
    if (lowerText.startsWith('let') || lowerText.startsWith('can') || lowerText.includes('should')) return 'action';
    return 'reply';
  }

  async testConnection(): Promise<boolean> {
    if (!this.model) return false;

    try {
      const result = await this.model.generateContent('Say "Hello" in one word.');
      const response = await result.response;
      return response.text().toLowerCase().includes('hello');
    } catch (error) {
      console.error('Gemini AI connection test failed:', error);
      return false;
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const geminiAIService = new GeminiAIService();