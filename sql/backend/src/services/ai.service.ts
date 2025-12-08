import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import { AIError, AIResponse, UserRole } from '../models/query.model';
import { getSystemPrompt } from '../prompts/system-prompt';

export class AIService {
  private client: Anthropic;
  private readonly model = 'claude-3-5-sonnet-20241022';
  private readonly maxTokens = 2000;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate SQL query from natural language question
   */
  async generateSQL(question: string, role: UserRole): Promise<AIResponse> {
    try {
      logger.info('Generating SQL with Claude:', { question, role });

      const systemPrompt = getSystemPrompt(role);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.2, // Low temperature for consistent SQL generation
      });

      // Extract text content from Claude's response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new AIError('Unexpected response format from Claude');
      }

      const responseText = content.text.trim();
      
      // Parse JSON response
      let aiResponse: AIResponse;
      try {
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        
        aiResponse = JSON.parse(jsonText);
      } catch (parseError) {
        logger.error('Failed to parse AI response:', { responseText, parseError });
        throw new AIError('Failed to parse AI response as JSON');
      }

      // Validate response structure
      if (!aiResponse.sql || !aiResponse.explanation || !aiResponse.confidence) {
        throw new AIError('Invalid AI response structure');
      }

      logger.info('SQL generated successfully:', {
        sql: aiResponse.sql.substring(0, 100) + '...',
        confidence: aiResponse.confidence,
      });

      return aiResponse;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      logger.error('AI service error:', error);
      
      if (error instanceof Anthropic.APIError) {
        throw new AIError(`Claude API error: ${error.message}`);
      }

      throw new AIError('Failed to generate SQL query');
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      });

      return response.content.length > 0;
    } catch (error) {
      logger.error('AI health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
