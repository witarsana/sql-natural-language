import type { VercelRequest, VercelResponse } from '@vercel/node';
import Fastify from 'fastify';
import { testConnection } from '../src/config/database.config';
import { setupCors } from '../src/middleware/cors.middleware';
import { setupLogger } from '../src/middleware/logger.middleware';
import { errorHandler } from '../src/middleware/error.middleware';
import queryRoutes from '../src/routes/query.routes';

// Create Fastify instance (cached across invocations)
let app: any = null;
let isSetup = false;

async function getApp() {
  if (app && isSetup) {
    return app;
  }

  // Load environment variables
  require('dotenv').config();

  // Create new Fastify instance
  app = Fastify({
    logger: false,
    requestTimeout: parseInt(process.env.QUERY_TIMEOUT_MS || '30000'),
    bodyLimit: 1048576, // 1MB
  });

  try {
    // Setup middleware
    await setupLogger(app);
    await setupCors(app);

    // Error handler
    app.setErrorHandler(errorHandler);

    // API routes (no prefix needed - Vercel already routes /api/* to this function)
    await app.register(queryRoutes);

    // Health check endpoint (accessible via /api/health)
    app.get('/health', async () => {
      const dbHealthy = await testConnection();

      // Dynamic import to avoid circular dependencies
      const { aiService } = await import('../src/services/ai.service');
      const aiHealthy = await aiService.healthCheck();

      return {
        status: dbHealthy && aiHealthy ? 'healthy' : 'unhealthy',
        services: {
          database: dbHealthy ? 'connected' : 'disconnected',
          ai: aiHealthy ? 'available' : 'unavailable',
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      };
    });

    // 404 handler
    app.setNotFoundHandler((request: any, reply: any) => {
      reply.status(404).send({
        success: false,
        error: 'Route not found',
        path: request.url,
      });
    });

    await app.ready();
    isSetup = true;
  } catch (error) {
    console.error('Error setting up Fastify app:', error);
    throw error;
  }

  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const fastifyApp = await getApp();

    // Build the full URL path
    const url = req.url || '/';

    // Use Fastify's inject method to process the request
    const response = await fastifyApp.inject({
      method: req.method || 'GET',
      url: url,
      headers: req.headers,
      payload: req.body,
    });

    // Set status code
    res.status(response.statusCode);

    // Copy all headers from Fastify response
    Object.keys(response.headers).forEach((key) => {
      const value = response.headers[key];
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    });

    // Send response
    return res.send(response.body);
  } catch (error) {
    console.error('Handler error:', error);

    // Fallback CORS headers on error
    const origin = req.headers.origin;
    if (origin && (origin === 'https://chloe-sigma.vercel.app' || origin === 'http://localhost:4200')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
