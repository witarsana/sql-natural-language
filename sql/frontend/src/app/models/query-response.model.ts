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
    generatedSQL: string;
    role: string;
    timestamp: string;
    cached?: boolean;
  };
}

export interface ExampleQuery {
  category: string;
  queries: string[];
}
