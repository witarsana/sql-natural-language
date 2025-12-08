import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { QueryError } from '../models/query.model';

export const errorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation error',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Handle custom query errors
  if (error instanceof QueryError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // Handle Fastify validation errors
  if ('validation' in error) {
    return reply.status(400).send({
      success: false,
      error: 'Request validation failed',
      details: error.validation,
    });
  }

  // Handle generic errors
  const statusCode = 'statusCode' in error ? error.statusCode : 500;
  
  return reply.status(statusCode || 500).send({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
