/**
 * SQL Sanitization Utilities
 * Additional layer of protection against SQL injection
 */

import { ValidationError } from '../models/query.model';

export class SQLSanitizer {
  /**
   * Escape special characters in SQL strings
   */
  static escapeString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x00/g, '\\0')
      .replace(/\x1a/g, '\\Z');
  }

  /**
   * Validate identifier (table or column name)
   */
  static validateIdentifier(identifier: string): boolean {
    // Allow alphanumeric, underscore, and dots (for qualified names)
    const pattern = /^[a-zA-Z0-9_\.]+$/;
    return pattern.test(identifier);
  }

  /**
   * Remove dangerous comments from SQL
   */
  static removeComments(sql: string): string {
    // Remove single-line comments (-- and #)
    let cleaned = sql.replace(/--[^\n]*/g, '');
    cleaned = cleaned.replace(/#[^\n]*/g, '');
    
    // Remove multi-line comments (/* */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return cleaned;
  }

  /**
   * Check for hex-encoded attacks
   */
  static checkHexEncoding(sql: string): void {
    const hexPattern = /0x[0-9a-fA-F]+/g;
    const hexMatches = sql.match(hexPattern);
    
    if (hexMatches && hexMatches.length > 0) {
      // Allow hex in specific contexts (like colors), but be suspicious
      if (hexMatches.some(hex => hex.length > 10)) {
        throw new ValidationError('Suspicious hex-encoded content detected');
      }
    }
  }

  /**
   * Validate that query doesn't contain encoded commands
   */
  static checkEncodedCommands(sql: string): void {
    const decoded = decodeURIComponent(sql);
    
    if (decoded !== sql) {
      // SQL was URL-encoded, check decoded version
      const dangerousPatterns = [
        /DROP/i,
        /DELETE/i,
        /INSERT/i,
        /UPDATE/i,
        /ALTER/i,
        /CREATE/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(decoded)) {
          throw new ValidationError('Encoded dangerous SQL command detected');
        }
      }
    }
  }

  /**
   * Full sanitization check
   */
  static sanitizeSQL(sql: string): string {
    // Check for encoded attacks
    this.checkEncodedCommands(sql);
    
    // Check for hex encoding
    this.checkHexEncoding(sql);
    
    // Remove comments
    const cleanSQL = this.removeComments(sql);
    
    return cleanSQL.trim();
  }
}
