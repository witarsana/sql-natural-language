import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export const setupLogger = (fastify: FastifyInstance) => {
  // Request logging
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info({
      type: 'request',
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  });

  // Response logging
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info({
      type: 'response',
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    });
  });
};
