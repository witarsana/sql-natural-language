export interface Message {
  id: string;
  type: "user" | "system" | "error";
  content: string;
  timestamp: Date;
  data?: QueryResult;
  metadata?: QueryMetadata;
}

export interface QueryResult {
  rows: Record<string, any>[];
  columns: string[];
  rowCount: number;
}

export interface QueryMetadata {
  executionTime: number;
  generatedSQL: string;
  role: string;
  timestamp: string;
  cached?: boolean;
}
