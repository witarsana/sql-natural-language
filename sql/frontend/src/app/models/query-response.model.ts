export interface QueryRequest {
  question: string;
  role: string;
  sessionId?: string;
}

export interface QueryResponse {
  success: boolean;
  data?: {
    rows: Record<string, any>[];
    columns: string[];
    rowCount: number;
  };
  error?: string;
  metadata: {
    executionTime: number;
    generatedSQL?: string;
    role: string;
    timestamp: string;
    cached?: boolean;
    explanation?: string;
    confidence?: "high" | "medium" | "low";
  };
  needsClarification?: boolean;
  clarificationPrompt?: string;
  missingContext?: MissingContext[];
}

export interface MissingContext {
  field: string;
  message: string;
  suggestions?: string[];
}

export interface ExampleQuery {
  category: string;
  queries: string[];
}
