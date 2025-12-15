import fs from 'fs';
import path from 'path';

let cachedSchema: string | null = null;

/**
 * Loads and caches the DATABASE_SCHEMA.md file content
 * This ensures the AI has access to the complete, accurate database schema
 * @returns The complete content of DATABASE_SCHEMA.md
 * @throws Error if the schema file cannot be read
 */
export const getDatabaseSchema = (): string => {
  if (cachedSchema) {
    return cachedSchema;
  }

  const schemaPath = path.join(__dirname, '../../docs/DATABASE_SCHEMA.md');

  try {
    cachedSchema = fs.readFileSync(schemaPath, 'utf-8');
    return cachedSchema;
  } catch (error) {
    throw new Error(`Failed to load DATABASE_SCHEMA.md from ${schemaPath}: ${error}`);
  }
};
