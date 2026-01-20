// Query validation to check if query has sufficient context

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

const cemeteryKeywords = [
  "cemetery",
  "cemeteries",
  "site",
  "location",
  "facility",
];

const cemeteryNamePatterns = [
  /\b[A-Z][a-z]+\s+(Cemetery|Cemeteries)\b/,
  /\bat\s+([A-Z][a-z\s]+)/,
  /\bin\s+([A-Z][a-z\s]+)/,
];

/**
 * Validate if query has sufficient context to execute
 */
export function validateQuery(
  question: string,
  conversationHistory?: any[]
): ValidationResult {
  const lowerQuestion = question.toLowerCase();
  const missingContext: MissingContext[] = [];

  // Check if query might need cemetery context
  const needsCemeteryContext = mightNeedCemeteryContext(
    question,
    conversationHistory
  );
  const hasCemetery = hasCemeteryIdentifier(question, conversationHistory);

  if (needsCemeteryContext && !hasCemetery) {
    missingContext.push({
      field: "cemetery",
      message: "Which cemetery would you like to search in?",
      suggestions: getCemeterySuggestions(),
    });
  }

  if (missingContext.length > 0) {
    console.log("Query validation failed - missing context:", {
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
function mightNeedCemeteryContext(
  question: string,
  conversationHistory?: any[]
): boolean {
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
    lowerQuestion.includes(keyword)
  );
}

/**
 * Check if query already has cemetery identifier
 */
function hasCemeteryIdentifier(
  question: string,
  conversationHistory?: any[]
): boolean {
  // Check for explicit cemetery keywords in the current question
  const hasKeyword = cemeteryKeywords.some((keyword) =>
    question.toLowerCase().includes(keyword)
  );

  if (hasKeyword) {
    return true;
  }

  // Check for cemetery name patterns in the current question
  const hasPattern = cemeteryNamePatterns.some((pattern) =>
    pattern.test(question)
  );

  if (hasPattern) {
    return true;
  }

  // If not in the current question, check the conversation history
  if (conversationHistory) {
    for (const message of conversationHistory) {
      const text = message.text || "";
      const hasKeywordInHistory = cemeteryKeywords.some((keyword) =>
        text.toLowerCase().includes(keyword)
      );
      if (hasKeywordInHistory) {
        return true;
      }
      const hasPatternInHistory = cemeteryNamePatterns.some((pattern) =>
        pattern.test(text)
      );
      if (hasPatternInHistory) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get cemetery suggestions (this could be fetched from database)
 */
function getCemeterySuggestions(): string[] {
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
export function buildClarificationPrompt(
  missingContext: MissingContext[]
): string {
  const prompts = missingContext.map((context) => {
    let prompt = context.message;
    if (context.suggestions && context.suggestions.length > 0) {
      prompt += `\n\nSuggestions:\n${context.suggestions
        .map((s) => `- ${s}`)
        .join("\n")}`;
    }
    return prompt;
  });

  return prompts.join("\n\n");
}
