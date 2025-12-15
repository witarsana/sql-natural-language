// SQL Validation utilities for serverless

const DANGEROUS_PATTERNS = [
  /\bDROP\s+/i,
  /\bDELETE\s+FROM\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+/i,
  /\bALTER\s+/i,
  /\bCREATE\s+/i,
  /\bTRUNCATE\s+/i,
  /\bREPLACE\s+INTO\b/i,
  /\bMERGE\s+/i,
  /\bGRANT\s+/i,
  /\bREVOKE\s+/i
];

export function validateSQL(sql: string): void {
  const upperSQL = sql.toUpperCase();

  // Check for dangerous patterns (word boundaries to avoid false positives like "deleted_at")
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sql)) {
      throw new Error(`Forbidden SQL operation detected: ${pattern.source}`);
    }
  }

  // Must be a SELECT query
  if (!upperSQL.trim().startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }
}

export function sanitizeSQL(sql: string): string {
  // Remove comments
  let sanitized = sql.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove trailing semicolons (MySQL doesn't like them before LIMIT)
  sanitized = sanitized.replace(/;+\s*$/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

export function injectSafetyFilters(sql: string): string {
  // This is a simplified version
  // The full version would parse the SQL and inject deleted_at filters
  return sql;
}

export function validateResultLimit(sql: string, maxResults: number): string {
  const upperSQL = sql.toUpperCase();

  // If query already has a LIMIT, use it
  if (upperSQL.includes('LIMIT')) {
    return sql;
  }

  // Add LIMIT to prevent huge result sets
  return `${sql} LIMIT ${maxResults}`;
}
