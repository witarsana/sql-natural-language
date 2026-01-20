import { UserRole, AIResponse, ChatMessage } from "../models/query.model";
import { aiService } from "./ai.service";
import { validationService } from "./validation.service";
import { env } from "../config/env.config";
import { logger } from "../utils/logger";

export class QueryBuilderService {
  /**
   * Main orchestration: Natural language -> Validated SQL with conversation context
   */
  async buildQuery(
    question: string,
    role?: UserRole,
    conversationHistory?: ChatMessage[]
  ): Promise<AIResponse> {
    try {
      logger.info("Building query:", { question, role, hasHistory: !!conversationHistory });

      // Step 1: Generate SQL using AI with conversation context
      const aiResponse = await aiService.generateSQL(question, role, conversationHistory);

      // Step 2: Validate SQL for safety
      validationService.validateSQL(aiResponse.sql);

      // Step 3: Inject safety filters (deleted_at)
      let safeSql = validationService.injectSafetyFilters(aiResponse.sql);

      // Step 4: Add result limit if needed
      safeSql = validationService.validateResultLimit(
        safeSql,
        env.MAX_QUERY_RESULTS
      );

      // Return enhanced response
      return {
        sql: safeSql,
        explanation: aiResponse.explanation,
        confidence: aiResponse.confidence,
      };
    } catch (error) {
      logger.error("Query building failed:", error);
      throw error;
    }
  }

  /**
   * Validate a raw SQL query (for testing/admin use)
   */
  validateRawSQL(sql: string): { valid: boolean; error?: string } {
    try {
      validationService.validateSQL(sql);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      };
    }
  }
}

// Export singleton instance
export const queryBuilderService = new QueryBuilderService();
