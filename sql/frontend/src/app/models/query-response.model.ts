export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QueryRequest {
  question: string;
  role?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
  conversationHistory?: ChatMessage[];
}

export interface QueryResponse {
  success: boolean;
  data?: {
    rows: Record<string, any>[];
    columns: string[];
    rowCount: number;
    hasMore?: boolean;
    totalCount?: number;
    limit?: number;
    offset?: number;
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
