import Fastify from 'fastify';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from '../config/env.config';
import { testConnection } from '../config/database.config';
import { setupCors } from '../middleware/cors.middleware';
import { setupLogger } from '../middleware/logger.middleware';
import { errorHandler } from '../middleware/error.middleware';
import queryRoutes from '../routes/query.routes';

// Create Fastify instance for serverless
const app = Fastify({
  logger: false, // Using Winston instead
  requestTimeout: env.QUERY_TIMEOUT_MS,
  bodyLimit: 1048576, // 1MB
});

// Setup middleware
let isSetup = false;
async function setupApp() {
  if (isSetup) return;

  await setupLogger(app);
  await setupCors(app);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get('/health', async () => {
    const dbHealthy = await testConnection();

    // Dynamic import to avoid circular dependencies
    const { aiService } = await import('../services/ai.service');
    const aiHealthy = await aiService.healthCheck();

    return {
      status: dbHealthy && aiHealthy ? 'healthy' : 'unhealthy',
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        ai: aiHealthy ? 'available' : 'unavailable',
      },
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  // API routes
  await app.register(queryRoutes, { prefix: '/api' });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route not found',
      path: request.url,
    });
  });

  await app.ready();
  isSetup = true;
}

// Export handler for Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await setupApp();

    // Build the full URL path with query string
    const url = req.url || '/';

    // Convert Vercel request to Fastify-compatible format
    const response = await app.inject({
      method: (req.method || 'GET') as any,
      url: url,
      headers: req.headers as any,
      payload: req.body,
    });

    // Set status code
    res.status(response.statusCode);

    // Copy headers from Fastify response to Vercel response
    Object.keys(response.headers).forEach((key) => {
      const value = response.headers[key];
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    });

    // Send response body
    return res.send(response.body);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).send({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};
