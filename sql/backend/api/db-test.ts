import type { VercelRequest, VercelResponse } from '@vercel/node';
import knex from 'knex';

export default async (req: VercelRequest, res: VercelResponse) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment_variables: {},
    connection_test: {},
  };

  try {
    // Step 1: Check environment variables
    diagnostics.environment_variables = {
      DATABASE_HOST: process.env.DATABASE_HOST || 'NOT SET',
      DATABASE_PORT: process.env.DATABASE_PORT || 'NOT SET',
      DATABASE_USER: process.env.DATABASE_USER || 'NOT SET',
      DATABASE_NAME: process.env.DATABASE_NAME || 'NOT SET',
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? '***SET***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Step 2: Check if we can create a connection
    diagnostics.connection_test.step = 'Creating Knex instance';

    const db = knex({
      client: 'mysql2',
      connection: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectTimeout: 10000,
      },
      pool: { min: 0, max: 1 },
    });

    diagnostics.connection_test.step = 'Attempting connection';

    // Step 3: Try to connect
    try {
      const result = await db.raw('SELECT 1 as test');
      diagnostics.connection_test.success = true;
      diagnostics.connection_test.result = result[0];
      diagnostics.connection_test.message = '✅ Database connection successful!';
    } catch (dbError: any) {
      diagnostics.connection_test.success = false;
      diagnostics.connection_test.error = {
        message: dbError.message,
        code: dbError.code,
        errno: dbError.errno,
        sqlState: dbError.sqlState,
        sqlMessage: dbError.sqlMessage,
        stack: dbError.stack?.split('\n').slice(0, 5),
      };
    } finally {
      await db.destroy();
    }

    // Step 4: Try raw TCP connection test
    diagnostics.tcp_test = {
      note: 'Testing if we can reach the host:port at all',
    };

    try {
      const testResponse = await fetch(
        `http://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        }
      ).catch((err) => ({ error: err.message }));

      diagnostics.tcp_test.result = testResponse;
    } catch (tcpError: any) {
      diagnostics.tcp_test.error = tcpError.message;
    }

    return res.status(200).json(diagnostics);
  } catch (error: any) {
    diagnostics.fatal_error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    };
    return res.status(500).json(diagnostics);
  }
};
