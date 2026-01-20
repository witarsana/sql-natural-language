import { logger } from "../utils/logger";
import { ChatMessage } from "../models/query.model";

export interface ValidationResult {
  isValid: boolean;
  missingContext?: MissingContext[];
  reason?: string;
}

export interface MissingContext {
  field: string;
  message: string;
  suggestions?: string[];
}

/**
 * Service to validate if a query has sufficient context
 */
export class QueryValidatorService {
  private cemeteryKeywords = [
    "cemetery",
    "cemeteries",
    "site",
    "location",
    "facility",
  ];

  private cemeteryNamePatterns = [
    /\b[A-Z][a-z]+\s+(Cemetery|Cemeteries)\b/,
    /\bat\s+([A-Z][a-z\s]+)/,
    /\bin\s+([A-Z][a-z\s]+)/,
  ];

  /**
   * Validate if query has sufficient context to execute
   * Now checks conversation history for missing context
   */
  validateQuery(
    question: string,
    conversationHistory?: ChatMessage[],
  ): ValidationResult {
    const lowerQuestion = question.toLowerCase();
    const missingContext: MissingContext[] = [];

    // Check if query might need cemetery context
    const needsCemeteryContext = this.mightNeedCemeteryContext(question);
    const hasCemeteryIdentifier = this.hasCemeteryIdentifier(question);

    // Check conversation history for cemetery context
    const hasCemeteryInHistory = this.hasCemeteryInHistory(conversationHistory);

    if (
      needsCemeteryContext &&
      !hasCemeteryIdentifier &&
      !hasCemeteryInHistory
    ) {
      missingContext.push({
        field: "cemetery",
        message: "Which cemetery would you like to search in?",
        suggestions: this.getCemeterySuggestions(),
      });
    }

    if (missingContext.length > 0) {
      logger.info("Query validation failed - missing context:", {
        question,
        missingContext,
      });

      return {
        isValid: false,
        missingContext,
        reason: "Query requires additional context to proceed",
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Check if query might need cemetery context
   */
  private mightNeedCemeteryContext(question: string): boolean {
    const lowerQuestion = question.toLowerCase();

    // Queries that explicitly mention "all" or specific cemetery don't need clarification
    if (
      lowerQuestion.includes("all cemeteries") ||
      lowerQuestion.includes("every cemetery") ||
      lowerQuestion.includes("total across") ||
      lowerQuestion.includes("system-wide") ||
      lowerQuestion.includes("at all cemeteries")
    ) {
      return false;
    }

    // Queries about plots, sections, persons typically need cemetery context
    const requiresCemeteryKeywords = [
      "plot",
      "section",
      "grave",
      "burial",
      "interment",
      "person",
      "deceased",
      "row",
      "lot",
      "available",
      "occupied",
      "reserved",
    ];

    return requiresCemeteryKeywords.some((keyword) =>
      lowerQuestion.includes(keyword),
    );
  }

  /**
   * Check if query already has cemetery identifier
   */
  private hasCemeteryIdentifier(question: string): boolean {
    // Check for explicit cemetery keywords
    const hasKeyword = this.cemeteryKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword),
    );

    if (hasKeyword) {
      return true;
    }

    // Check for cemetery name patterns (e.g., "Rookwood Cemetery", "at Eastern Suburbs")
    const hasPattern = this.cemeteryNamePatterns.some((pattern) =>
      pattern.test(question),
    );

    return hasPattern;
  }

  /**
   * Check if conversation history contains cemetery context
   */
  private hasCemeteryInHistory(conversationHistory?: ChatMessage[]): boolean {
    if (!conversationHistory || conversationHistory.length === 0) {
      return false;
    }

    // Check last 10 messages for cemetery mentions (increased from 5)
    const recentMessages = conversationHistory.slice(-10);

    for (const message of recentMessages) {
      const content = message.content;

      // Check if any message mentions a cemetery keyword or identifier
      if (this.hasCemeteryIdentifier(content)) {
        logger.info("Found cemetery context in conversation history", {
          message: content.substring(0, 100),
        });
        return true;
      }

      // Check for specific cemetery name patterns (more explicit)
      // Look for common cemetery names in the schema
      const knownCemeteryPatterns = [
        /Astana\s+Tegal\s+Gundul/i,
        /Demo\s+Bali\s+Office/i,
        /Auckland\s+Memorial\s+Park/i,
        /Adjungbilly\s+Cemetery/i,
        /Alma\s+Plains\s+Cemetery/i,
        /Alma\s+South\s+Cemetery/i,
        /Angle\s+Grove\s+Cemetery/i,
        /Anglican\s+Parish\s+of\s+Gawler/i,
        /Apsley\s+Cemetery/i,
        /Ardrossan\s+Cemetery/i,
        /Armidale\s+Cemetery/i,
      ];

      for (const pattern of knownCemeteryPatterns) {
        if (pattern.test(content)) {
          logger.info("Found known cemetery name in conversation history", {
            message: content.substring(0, 100),
          });
          return true;
        }
      }

      // Also check for proper nouns (cemetery names) - typically capitalized words
      // but exclude common person names that might appear in queries
      const hasProperNoun = this.hasProperNounPattern(content);
      if (hasProperNoun) {
        // Make sure it's not just a person name query
        const isPersonNameQuery =
          /name.*contains|first.*name|last.*name|person.*named/i.test(content);
        if (!isPersonNameQuery) {
          logger.info("Found potential cemetery name in conversation history", {
            message: content.substring(0, 100),
          });
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if text contains proper noun patterns that might be cemetery names
   * Proper nouns are sequences of capitalized words (2+ consecutive)
   */
  private hasProperNounPattern(text: string): boolean {
    // Examples: "Astana Tegal Gundul", "Auckland Memorial Park", "Demo Bali Office"
    const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/;

    // Also match common cemetery location/name keywords (case insensitive)
    const locationPattern =
      /\b(?:Astana|Auckland|Demo|Memorial|Park|Office|Plains|Grove|Parish|South|Alma|Angle|Anglican|Apsley|Adjungbilly|Armidale|Ardrossan|Gawler|Gundul|Tegal|Bali)\b/i;

    return properNounPattern.test(text) || locationPattern.test(text);
  }

  /**
   * Get cemetery suggestions (this could be fetched from database)
   */
  private getCemeterySuggestions(): string[] {
    // These could be dynamically fetched from the database
    return [
      "All cemeteries",
      "Astana Tegal Gundul",
      "Demo Bali Office",
      "Auckland Memorial Park Cemetery",
    ];
  }

  /**
   * Build clarification prompt for user
   */
  buildClarificationPrompt(missingContext: MissingContext[]): string {
    const prompts = missingContext.map((context) => {
      let prompt = context.message;
      if (context.suggestions && context.suggestions.length > 0) {
        prompt += `\n\nSuggestions:\n${context.suggestions.map((s) => `- ${s}`).join("\n")}`;
      }
      return prompt;
    });

    return prompts.join("\n\n");
  }
}

// Export singleton instance
export const queryValidatorService = new QueryValidatorService();
