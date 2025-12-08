import knex, { Knex } from 'knex';
import { env } from './env.config';
import { logger } from '../utils/logger';

// Knex configuration
const knexConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    timezone: 'UTC',
    charset: 'utf8mb4',
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  acquireConnectionTimeout: 30000,
  debug: env.NODE_ENV === 'development',
};

// Create Knex instance
export const db = knex(knexConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connection established');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};
