import Fastify from 'fastify';
import { env } from './config/env.config';
import { testConnection, closeDatabase } from './config/database.config';
import { setupCors } from './middleware/cors.middleware';
import { setupLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import queryRoutes from './routes/query.routes';

// Create Fastify instance
const fastify = Fastify({
  logger: false, // Using Winston instead
  requestTimeout: env.QUERY_TIMEOUT_MS,
  bodyLimit: 1048576, // 1MB
});

// Setup middleware
setupLogger(fastify);
setupCors(fastify);

// Error handler
fastify.setErrorHandler(errorHandler);

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const dbHealthy = await testConnection();
  
  // Dynamic import to avoid circular dependencies
  const { aiService } = await import('./services/ai.service');
  const aiHealthy = await aiService.healthCheck();
  
  return {
    status: dbHealthy && aiHealthy ? 'healthy' : 'unhealthy',
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      ai: aiHealthy ? 'available' : 'unavailable',
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  };
});

// API routes
fastify.register(queryRoutes, { prefix: '/api' });

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    error: 'Route not found',
    path: request.url,
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  try {
    await fastify.close();
    await closeDatabase();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Start listening
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`
╔═══════════════════════════════════════════════════════════╗
║  Chronicle Natural Language Query System                  ║
║  Server running on: http://${env.HOST}:${env.PORT}                ║
║  Environment: ${env.NODE_ENV.padEnd(44)}║
║  Health check: http://${env.HOST}:${env.PORT}/health          ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
