import { z } from "zod";

// User roles
export enum UserRole {
  ADMIN = "Admin",
  SALES = "Sales",
  OPERATIONS = "Operations",
  MANAGEMENT = "Management",
}

// Chat message for conversation history
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Query request schema
export const queryRequestSchema = z.object({
  question: z.string().min(1).max(500),
  role: z.nativeEnum(UserRole).optional(),
  sessionId: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;

// Query response types
export interface QueryResponse {
  success: boolean;
  data?: QueryResultData;
  error?: string;
  metadata: QueryMetadata;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  missingContext?: MissingContext[];
}

export interface QueryResultData {
  rows: Record<string, any>[];
  columns: string[];
  rowCount: number;
}

export interface QueryMetadata {
  executionTime: number;
  generatedSQL?: string;
  role: UserRole;
  timestamp: string;
  cached?: boolean;
  explanation?: string;
  confidence?: "high" | "medium" | "low";
}

export interface MissingContext {
  field: string;
  message: string;
  suggestions?: string[];
}

// AI response schema
export interface AIResponse {
  sql: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

// Error types
export class QueryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "QueryError";
  }
}

export class ValidationError extends QueryError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends QueryError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}

export class AIError extends QueryError {
  constructor(message: string) {
    super(message, "AI_ERROR", 500);
    this.name = "AIError";
  }
}
