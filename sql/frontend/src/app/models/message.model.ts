export interface Message {
  id: string;
  type: "user" | "system" | "error" | "clarification";
  content: string;
  timestamp: Date;
  data?: QueryResult;
  metadata?: QueryMetadata;
  missingContext?: MissingContext[];
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
