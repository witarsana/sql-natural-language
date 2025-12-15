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
export function validateQuery(question: string): ValidationResult {
  const lowerQuestion = question.toLowerCase();
  const missingContext: MissingContext[] = [];

  // Check if query might need cemetery context
  const needsCemeteryContext = mightNeedCemeteryContext(question);
  const hasCemetery = hasCemeteryIdentifier(question);

  if (needsCemeteryContext && !hasCemetery) {
    missingContext.push({
      field: "cemetery",
      message: "Which cemetery would you like to search in?",
      suggestions: getCemeterySuggestions(),
    });
  }

  if (missingContext.length > 0) {
    console.log('Query validation failed - missing context:', {
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
function mightNeedCemeteryContext(question: string): boolean {
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
function hasCemeteryIdentifier(question: string): boolean {
  // Check for explicit cemetery keywords
  const hasKeyword = cemeteryKeywords.some((keyword) =>
    question.toLowerCase().includes(keyword)
  );

  if (hasKeyword) {
    return true;
  }

  // Check for cemetery name patterns (e.g., "Rookwood Cemetery", "at Eastern Suburbs")
  const hasPattern = cemeteryNamePatterns.some((pattern) =>
    pattern.test(question)
  );

  return hasPattern;
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
export function buildClarificationPrompt(missingContext: MissingContext[]): string {
  const prompts = missingContext.map((context) => {
    let prompt = context.message;
    if (context.suggestions && context.suggestions.length > 0) {
      prompt += `\n\nSuggestions:\n${context.suggestions.map((s) => `- ${s}`).join("\n")}`;
    }
    return prompt;
  });

  return prompts.join("\n\n");
}
