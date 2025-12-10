export interface Message {
  id: string;
  type: "user" | "system" | "error" | "clarification";
  content: string;
  timestamp: Date;
  data?: QueryResult;
  metadata?: QueryMetadata;
  missingContext?: MissingContext[];
  originalQuestion?: string; // Store original question for pagination
}

export interface MissingContext {
  field: string;
  message: string;
  suggestions?: string[];
}

export interface QueryResult {
  rows: Record<string, any>[];
  columns: string[];
  rowCount: number;
  hasMore?: boolean;
  totalCount?: number;
  limit?: number;
  offset?: number;
}

export interface QueryMetadata {
  executionTime: number;
  generatedSQL?: string;
  role: string;
  timestamp: string;
  cached?: boolean;
  explanation?: string;
  confidence?: "high" | "medium" | "low";
}
