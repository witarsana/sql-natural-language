import { describe, it, expect, beforeEach } from '@jest/globals';
import { QueryBuilderService } from '../src/services/query-builder.service';
import { UserRole } from '../src/models/query.model';

describe('QueryBuilderService', () => {
  let service: QueryBuilderService;

  beforeEach(() => {
    service = new QueryBuilderService();
  });

  describe('validateRawSQL', () => {
    it('should accept valid SELECT queries', () => {
      const sql = 'SELECT * FROM plots WHERE plot_deleted_at IS NULL';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(true);
    });

    it('should reject DELETE queries', () => {
      const sql = 'DELETE FROM plots WHERE plot_id = 1';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('DELETE');
    });

    it('should reject DROP queries', () => {
      const sql = 'DROP TABLE plots';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('DROP');
    });

    it('should reject INSERT queries', () => {
      const sql = 'INSERT INTO plots VALUES (1, 2, 3)';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('INSERT');
    });

    it('should reject UPDATE queries', () => {
      const sql = 'UPDATE plots SET plot_status_id = 1';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('UPDATE');
    });

    it('should reject SQL injection attempts', () => {
      const sql = "SELECT * FROM plots WHERE plot_id = 1; DROP TABLE plots;--";
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
    });

    it('should reject non-SELECT queries', () => {
      const sql = 'SHOW TABLES';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only SELECT queries');
    });

    it('should accept queries with JOINs', () => {
      const sql = `
        SELECT plots.*, plot_statuses.plot_status_name 
        FROM plots 
        LEFT JOIN plot_statuses ON plots.plot_status_id = plot_statuses.plot_status_id 
        WHERE plots.plot_deleted_at IS NULL
      `;
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(true);
    });

    it('should accept queries with COUNT', () => {
      const sql = 'SELECT COUNT(*) as total FROM plots WHERE plot_deleted_at IS NULL';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(true);
    });

    it('should accept queries with GROUP BY', () => {
      const sql = `
        SELECT plot_status_id, COUNT(*) as count 
        FROM plots 
        WHERE plot_deleted_at IS NULL 
        GROUP BY plot_status_id
      `;
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(true);
    });

    it('should reject queries with unbalanced parentheses', () => {
      const sql = 'SELECT * FROM plots WHERE (plot_status_id = 1';
      const result = service.validateRawSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('parentheses');
    });
  });
});
