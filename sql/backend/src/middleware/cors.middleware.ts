import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { env } from '../config/env.config';

export const setupCors = async (fastify: FastifyInstance) => {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());

  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
};
