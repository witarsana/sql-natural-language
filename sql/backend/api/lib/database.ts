import knex, { Knex } from 'knex';

// Serverless-optimized database connection
// Uses connection pooling with smaller pool size for serverless
let dbInstance: Knex | null = null;

export function getDatabase(): Knex {
  if (!dbInstance) {
    // Trim environment variables to remove any whitespace/newlines
    const config: Knex.Config = {
      client: 'mysql2',
      connection: {
        host: process.env.DATABASE_HOST?.trim()!,
        port: parseInt((process.env.DATABASE_PORT || '3306').trim()),
        user: process.env.DATABASE_USER?.trim()!,
        password: process.env.DATABASE_PASSWORD?.trim()!,
        database: process.env.DATABASE_NAME?.trim()!,
        timezone: 'UTC',
        charset: 'utf8mb4',
      },
      pool: {
        min: 0, // Serverless: start with 0 connections
        max: 1, // Serverless: limit to 1 connection per instance
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
      acquireConnectionTimeout: 30000,
    };

    dbInstance = knex(config);
  }

  return dbInstance;
}

export async function testConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function executeQuery(sql: string): Promise<any> {
  const db = getDatabase();
  const results = await db.raw(sql);

  // MySQL returns results in format: [rows, fields]
  const rows = Array.isArray(results[0]) ? results[0] : [];

  return {
    rows,
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    rowCount: rows.length,
  };
}
