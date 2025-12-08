import { db } from '../config/database.config';
import { env } from '../config/env.config';
import { DatabaseError, QueryResultData } from '../models/query.model';
import { logger } from '../utils/logger';

export class DatabaseService {
  /**
   * Execute SQL query and return results
   */
  async executeQuery(sql: string): Promise<QueryResultData> {
    try {
      logger.info('Executing query:', { sql: sql.substring(0, 200) });

      const startTime = Date.now();

      // Execute query with timeout
      const rows = await Promise.race([
        db.raw(sql),
        this.timeout(env.QUERY_TIMEOUT_MS),
      ]);

      const executionTime = Date.now() - startTime;

      // Extract rows from Knex response
      const resultRows = rows[0] || [];

      // Get column names from first row or empty array
      const columns = resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

      logger.info('Query executed successfully:', {
        rowCount: resultRows.length,
        executionTime,
        columns: columns.length,
      });

      return {
        rows: resultRows,
        columns,
        rowCount: resultRows.length,
      };
    } catch (error) {
      logger.error('Database query execution failed:', error);

      if (error instanceof Error) {
        // Handle MySQL specific errors
        if ('code' in error) {
          const mysqlError = error as any;
          
          switch (mysqlError.code) {
            case 'ER_PARSE_ERROR':
            case 'ER_SYNTAX_ERROR':
              throw new DatabaseError('SQL syntax error');
            
            case 'ER_NO_SUCH_TABLE':
              throw new DatabaseError('Table does not exist');
            
            case 'ER_BAD_FIELD_ERROR':
              throw new DatabaseError('Column does not exist');
            
            case 'ETIMEDOUT':
            case 'ECONNREFUSED':
              throw new DatabaseError('Database connection error');
            
            default:
              throw new DatabaseError(`Database error: ${mysqlError.sqlMessage || error.message}`);
          }
        }
      }

      throw new DatabaseError('Failed to execute query');
    }
  }

  /**
   * Timeout promise helper
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new DatabaseError(`Query timeout: exceeded ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Test query execution (for health checks)
   */
  async testQuery(): Promise<boolean> {
    try {
      await db.raw('SELECT 1 as test');
      return true;
    } catch (error) {
      logger.error('Database test query failed:', error);
      return false;
    }
  }

  /**
   * Get table information
   */
  async getTableInfo(tableName: string): Promise<any[]> {
    try {
      const result = await db.raw(`DESCRIBE ${tableName}`);
      return result[0];
    } catch (error) {
      logger.error('Failed to get table info:', error);
      throw new DatabaseError(`Failed to get table info for ${tableName}`);
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {};

      // Get counts for main tables
      const tables = ['plots', 'graves', 'persons', 'sections', 'plot_statuses'];

      for (const table of tables) {
        const result = await db.raw(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result[0][0].count;
      }

      // Get available plots count
      const availablePlots = await db.raw(`
        SELECT COUNT(*) as count 
        FROM plots 
        LEFT JOIN plot_statuses ON plots.plot_status_id = plot_statuses.plot_status_id
        WHERE plots.plot_deleted_at IS NULL 
        AND plot_statuses.plot_status_name = 'Available'
      `);
      stats.availablePlots = availablePlots[0][0].count;

      // Get occupied plots count
      const occupiedPlots = await db.raw(`
        SELECT COUNT(DISTINCT plots.plot_id) as count 
        FROM plots 
        INNER JOIN graves ON plots.plot_id = graves.grave_plot_id
        WHERE plots.plot_deleted_at IS NULL 
        AND graves.grave_deleted_at IS NULL
      `);
      stats.occupiedPlots = occupiedPlots[0][0].count;

      return stats;
    } catch (error) {
      logger.error('Failed to get database statistics:', error);
      throw new DatabaseError('Failed to get database statistics');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
