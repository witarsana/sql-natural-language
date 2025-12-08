import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidationService } from '../src/services/validation.service';
import { ValidationError } from '../src/models/query.model';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  describe('validateSQL', () => {
    it('should accept valid SELECT queries', () => {
      const sql = 'SELECT * FROM plots WHERE plot_deleted_at IS NULL';
      expect(() => service.validateSQL(sql)).not.toThrow();
    });

    it('should throw error for DELETE queries', () => {
      const sql = 'DELETE FROM plots WHERE plot_id = 1';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/DELETE/);
    });

    it('should throw error for DROP queries', () => {
      const sql = 'DROP TABLE plots';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/DROP/);
    });

    it('should throw error for INSERT queries', () => {
      const sql = 'INSERT INTO plots VALUES (1, 2, 3)';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/INSERT/);
    });

    it('should throw error for UPDATE queries', () => {
      const sql = 'UPDATE plots SET plot_status_id = 1';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/UPDATE/);
    });

    it('should throw error for multiple statements', () => {
      const sql = 'SELECT * FROM plots; SELECT * FROM graves;';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/Multiple SQL statements/);
    });

    it('should throw error for queries without FROM clause', () => {
      const sql = 'SELECT 1';
      expect(() => service.validateSQL(sql)).toThrow(ValidationError);
      expect(() => service.validateSQL(sql)).toThrow(/FROM clause missing/);
    });

    it('should detect SQL injection patterns', () => {
      const injectionQueries = [
        "SELECT * FROM plots WHERE plot_id = 1; DROP TABLE plots;--",
        "SELECT * FROM plots WHERE plot_id = 1 UNION SELECT * FROM mysql.user",
        "SELECT * FROM plots WHERE plot_id = 1 OR 1=1",
      ];

      injectionQueries.forEach(sql => {
        expect(() => service.validateSQL(sql)).toThrow();
      });
    });

    it('should accept complex valid queries', () => {
      const sql = `
        SELECT 
          plots.plot_id,
          plots.plot_number,
          sections.section_name,
          plot_statuses.plot_status_name,
          COUNT(graves.grave_id) as grave_count
        FROM plots
        LEFT JOIN sections ON plots.plot_section_id = sections.section_id
        LEFT JOIN plot_statuses ON plots.plot_status_id = plot_statuses.plot_status_id
        LEFT JOIN graves ON plots.plot_id = graves.grave_plot_id AND graves.grave_deleted_at IS NULL
        WHERE plots.plot_deleted_at IS NULL
        GROUP BY plots.plot_id
        ORDER BY plots.plot_number
        LIMIT 100
      `;
      expect(() => service.validateSQL(sql)).not.toThrow();
    });
  });

  describe('injectSafetyFilters', () => {
    it('should add plot_deleted_at filter when missing', () => {
      const sql = 'SELECT * FROM plots WHERE plot_status_id = 1';
      const result = service.injectSafetyFilters(sql);
      expect(result).toContain('plot_deleted_at IS NULL');
    });

    it('should not duplicate plot_deleted_at filter', () => {
      const sql = 'SELECT * FROM plots WHERE plot_deleted_at IS NULL';
      const result = service.injectSafetyFilters(sql);
      const matches = result.match(/plot_deleted_at IS NULL/g);
      expect(matches?.length).toBe(1);
    });

    it('should add WHERE clause if missing', () => {
      const sql = 'SELECT * FROM plots ORDER BY plot_number';
      const result = service.injectSafetyFilters(sql);
      expect(result).toContain('WHERE plots.plot_deleted_at IS NULL');
    });

    it('should not affect queries without plots table', () => {
      const sql = 'SELECT * FROM sections WHERE section_id = 1';
      const result = service.injectSafetyFilters(sql);
      expect(result).toBe(sql);
    });
  });

  describe('validateResultLimit', () => {
    it('should add LIMIT when missing for non-aggregate queries', () => {
      const sql = 'SELECT * FROM plots WHERE plot_deleted_at IS NULL';
      const result = service.validateResultLimit(sql, 1000);
      expect(result).toContain('LIMIT 1000');
    });

    it('should not add LIMIT for aggregate queries', () => {
      const sql = 'SELECT COUNT(*) FROM plots WHERE plot_deleted_at IS NULL';
      const result = service.validateResultLimit(sql, 1000);
      expect(result).not.toContain('LIMIT');
    });

    it('should throw error if LIMIT exceeds maximum', () => {
      const sql = 'SELECT * FROM plots LIMIT 5000';
      expect(() => service.validateResultLimit(sql, 1000)).toThrow(ValidationError);
      expect(() => service.validateResultLimit(sql, 1000)).toThrow(/exceeds maximum/);
    });

    it('should accept LIMIT within maximum', () => {
      const sql = 'SELECT * FROM plots LIMIT 500';
      const result = service.validateResultLimit(sql, 1000);
      expect(result).toBe(sql);
    });
  });
});
