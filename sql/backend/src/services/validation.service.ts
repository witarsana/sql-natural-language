import { FORBIDDEN_KEYWORDS, ALLOWED_OPERATIONS } from '../models/schema.model';
import { ValidationError } from '../models/query.model';
import { logger } from '../utils/logger';

export class ValidationService {
  /**
   * Validate SQL query for safety and correctness
   */
  validateSQL(sql: string): void {
    const upperSQL = sql.toUpperCase();

    // 1. Check for forbidden keywords (DELETE, DROP, INSERT, etc.)
    this.checkForbiddenKeywords(upperSQL);

    // 2. Ensure it's a SELECT query
    this.ensureSelectQuery(upperSQL);

    // 3. Check for SQL injection patterns
    this.checkInjectionPatterns(sql);

    // 4. Validate query structure
    this.validateQueryStructure(upperSQL);

    logger.info('SQL validation passed');
  }

  /**
   * Check for forbidden SQL keywords
   */
  private checkForbiddenKeywords(sql: string): void {
    for (const keyword of FORBIDDEN_KEYWORDS) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(sql)) {
        throw new ValidationError(
          `Forbidden SQL keyword detected: ${keyword}. Only SELECT queries are allowed.`
        );
      }
    }
  }

  /**
   * Ensure query starts with SELECT
   */
  private ensureSelectQuery(sql: string): void {
    const trimmed = sql.trim();
    if (!trimmed.startsWith('SELECT')) {
      throw new ValidationError('Only SELECT queries are allowed');
    }
  }

  /**
   * Check for common SQL injection patterns
   */
  private checkInjectionPatterns(sql: string): void {
    const injectionPatterns = [
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /;\s*INSERT/i,
      /;\s*UPDATE/i,
      /UNION\s+SELECT.*INTO/i,
      /--\s*DROP/i,
      /\/\*.*\*\/.*DROP/i,
      /xp_cmdshell/i,
      /EXEC\s*\(/i,
      /EXECUTE\s*\(/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(sql)) {
        throw new ValidationError('Potential SQL injection detected');
      }
    }
  }

  /**
   * Validate overall query structure
   */
  private validateQueryStructure(sql: string): void {
    // Check for balanced parentheses
    const openParens = (sql.match(/\(/g) || []).length;
    const closeParens = (sql.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      throw new ValidationError('Unbalanced parentheses in SQL query');
    }

    // Check for multiple statements (semicolons)
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    if (statements.length > 1) {
      throw new ValidationError('Multiple SQL statements not allowed');
    }

    // Ensure FROM clause exists
    if (!sql.includes('FROM')) {
      throw new ValidationError('Invalid query: FROM clause missing');
    }
  }

  /**
   * Sanitize and add deleted_at filters if missing
   */
  injectSafetyFilters(sql: string): string {
    let safeSql = sql;

    // Add plot_deleted_at filter if querying plots table and filter is missing
    if (
      /\bFROM\s+plots\b/i.test(sql) && 
      !/plot_deleted_at\s+IS\s+NULL/i.test(sql)
    ) {
      // Find WHERE clause or add one
      if (/\bWHERE\b/i.test(sql)) {
        safeSql = safeSql.replace(
          /(\bWHERE\b)/i,
          '$1 plots.plot_deleted_at IS NULL AND'
        );
      } else {
        // Add WHERE before ORDER BY, LIMIT, or at end
        safeSql = safeSql.replace(
          /(\s+(?:ORDER BY|LIMIT|$))/i,
          ' WHERE plots.plot_deleted_at IS NULL$1'
        );
      }
      logger.info('Added plot_deleted_at filter to query');
    }

    return safeSql;
  }

  /**
   * Validate query results limit
   */
  validateResultLimit(sql: string, maxResults: number): string {
    const upperSQL = sql.toUpperCase();

    // If LIMIT already exists, validate it
    const limitMatch = upperSQL.match(/LIMIT\s+(\d+)/);
    if (limitMatch) {
      const requestedLimit = parseInt(limitMatch[1], 10);
      if (requestedLimit > maxResults) {
        throw new ValidationError(
          `LIMIT ${requestedLimit} exceeds maximum allowed ${maxResults}`
        );
      }
      return sql;
    }

    // Add LIMIT if not present and not an aggregate query
    const isAggregate = /\b(COUNT|SUM|AVG|MAX|MIN)\s*\(/i.test(sql);
    if (!isAggregate) {
      return `${sql.trim()} LIMIT ${maxResults}`;
    }

    return sql;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
