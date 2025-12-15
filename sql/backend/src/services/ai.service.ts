import { env } from "../config/env.config";
import { logger } from "../utils/logger";
import { AIError, AIResponse, UserRole } from "../models/query.model";
import { getSystemPrompt } from "../prompts/system-prompt";

/**
 * Format numbers in text with thousand separators
 */
function formatNumbersInText(text: string): string {
  // Match standalone numbers (not part of IDs, codes, or dates)
  // Look for numbers with 4+ digits that are word-bounded
  return text.replace(/\b(\d{4,})\b/g, (match) => {
    const num = parseInt(match, 10);
    return num.toLocaleString("en-US");
  });
}

export class AIService {
  private readonly apiKey: string;
  private readonly baseURL = "https://openrouter.ai/api/v1";
  // Using DeepSeek R1T2 Chimera - free model
  private readonly model = "tngtech/deepseek-r1t2-chimera:free";
  private readonly maxTokens = 2000;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY;
  }

  /**
   * Generate SQL query from natural language question
   */
  async generateSQL(question: string, role?: UserRole): Promise<AIResponse> {
    try {
      const effectiveRole = role || UserRole.ADMIN;

      logger.info("Generating SQL with OpenRouter:", {
        question,
        role: effectiveRole,
        model: this.model,
      });

      const systemPrompt = getSystemPrompt(effectiveRole);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Chronicle NL Query System",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.2,
          max_tokens: this.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("OpenRouter API error:", {
          status: response.status,
          error: errorText,
          model: this.model,
        });

        // If model not found, suggest checking available models
        if (response.status === 404) {
          logger.error(
            "Model not found. Please check available models at https://openrouter.ai/models"
          );
        }

        throw new AIError(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      // Check if response has the expected structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        logger.error("Invalid OpenRouter response structure:", { data });
        throw new AIError("Invalid response structure from OpenRouter");
      }

      const responseText = data.choices[0].message.content?.trim();

      if (!responseText) {
        logger.error("Empty response from OpenRouter:", { data });
        throw new AIError("Empty response from OpenRouter");
      }

      // Parse JSON response
      let aiResponse: AIResponse;
      try {
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch =
          responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
          responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : responseText;

        aiResponse = JSON.parse(jsonText);
      } catch (parseError) {
        logger.error("Failed to parse AI response:", {
          responseText,
          parseError,
        });
        throw new AIError("Failed to parse AI response as JSON");
      }

      // Validate response structure
      if (
        !aiResponse.sql ||
        !aiResponse.explanation ||
        !aiResponse.confidence
      ) {
        throw new AIError("Invalid AI response structure");
      }

      // Format numbers in the explanation with thousand separators
      aiResponse.explanation = formatNumbersInText(aiResponse.explanation);

      logger.info("SQL generated successfully:", {
        sql: aiResponse.sql.substring(0, 100) + "...",
        confidence: aiResponse.confidence,
      });

      return aiResponse;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      logger.error("AI service error:", error);

      if (error instanceof Error) {
        throw new AIError(`OpenRouter API error: ${error.message}`);
      }

      throw new AIError("Failed to generate SQL query");
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "user",
              content: "Hello",
            },
          ],
          max_tokens: 10,
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error("AI health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
