import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_PORT: z.string().transform(Number).pipe(z.number()).default('3306'),
  
  // AI
  ANTHROPIC_API_KEY: z.string().min(1),
  
  // Security
  ALLOWED_ORIGINS: z.string().default('http://localhost:4200'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Query Limits
  MAX_QUERY_RESULTS: z.string().transform(Number).pipe(z.number()).default('1000'),
  QUERY_TIMEOUT_MS: z.string().transform(Number).pipe(z.number()).default('30000'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
