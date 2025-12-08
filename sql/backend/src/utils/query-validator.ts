import { SCHEMA, ALLOWED_OPERATIONS } from '../models/schema.model';
import { ValidationError } from '../models/query.model';

export class QueryValidator {
  /**
   * Validate that query only uses allowed tables
   */
  static validateTables(sql: string): void {
    const upperSQL = sql.toUpperCase();
    const allowedTables = Object.values(SCHEMA).filter(v => typeof v === 'string');
    
    // Extract table names from FROM and JOIN clauses
    const tablePattern = /(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)/gi;
    const matches = upperSQL.matchAll(tablePattern);
    
    for (const match of matches) {
      const table = match[1].toLowerCase();
      if (!allowedTables.includes(table)) {
        throw new ValidationError(`Table '${table}' is not allowed or does not exist`);
      }
    }
  }

  /**
   * Validate that query only uses allowed fields
   */
  static validateFields(sql: string): void {
    // Extract field references (basic validation)
    // This is a simplified check - full validation would require SQL parsing
    const fieldPattern = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g;
    const matches = sql.matchAll(fieldPattern);
    
    for (const match of matches) {
      const table = match[1].toLowerCase();
      const field = match[2].toLowerCase();
      
      // Check if table exists in schema
      const allowedFields = SCHEMA.ALLOWED_FIELDS[table as keyof typeof SCHEMA.ALLOWED_FIELDS];
      
      if (allowedFields && !allowedFields.includes(field)) {
        throw new ValidationError(
          `Field '${field}' is not allowed or does not exist in table '${table}'`
        );
      }
    }
  }

  /**
   * Validate query operations
   */
  static validateOperations(sql: string): void {
    const upperSQL = sql.toUpperCase();
    
    // Check that only allowed operations are used
    // This is already covered by forbidden keywords check, but adds extra layer
    
    // Ensure no subqueries that might modify data
    if (upperSQL.includes('INTO OUTFILE') || upperSQL.includes('INTO DUMPFILE')) {
      throw new ValidationError('File operations are not allowed');
    }
    
    // Check for information_schema access (could leak schema info)
    if (upperSQL.includes('INFORMATION_SCHEMA')) {
      throw new ValidationError('Direct information_schema access is not allowed');
    }
    
    // Check for mysql system tables
    if (upperSQL.includes('MYSQL.')) {
      throw new ValidationError('System table access is not allowed');
    }
  }

  /**
   * Full query structure validation
   */
  static validateQueryStructure(sql: string): void {
    this.validateTables(sql);
    this.validateOperations(sql);
    // Field validation is optional (can be too strict)
    // this.validateFields(sql);
  }
}
