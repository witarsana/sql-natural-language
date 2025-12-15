import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateSQL, UserRole } from './lib/ai-service';
import { executeQuery } from './lib/database';
import { validateSQL, sanitizeSQL, validateResultLimit } from './lib/validation';
import { validateQuery, buildClarificationPrompt } from './lib/query-validator';

// CORS handler
function setCORS(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://chloe-sigma.vercel.app',
    'http://localhost:4200'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const startTime = Date.now();

  setCORS(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Parse request body
    const { question, role, limit, offset } = req.body as {
      question?: string;
      role?: string;
      limit?: number;
      offset?: number;
    };

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "question" field'
      });
    }

    // Convert role string to UserRole enum
    const userRole = (role as UserRole) || UserRole.ADMIN;

    console.log('Processing query:', { question, role: userRole });

    // Step 1: Validate query has sufficient context
    const validation = validateQuery(question);

    if (!validation.isValid && validation.missingContext) {
      const clarificationPrompt = buildClarificationPrompt(validation.missingContext);

      console.log('Query needs clarification:', { question, missingContext: validation.missingContext });

      return res.status(200).json({
        success: false,
        needsClarification: true,
        clarificationPrompt,
        missingContext: validation.missingContext,
        metadata: {
          executionTime: Date.now() - startTime,
          role: userRole,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Step 2: Generate SQL using AI
    const aiResponse = await generateSQL(question, userRole);

    console.log('AI generated SQL:', aiResponse.sql);

    // Step 3: Validate SQL for safety
    validateSQL(aiResponse.sql);

    // Step 4: Sanitize SQL
    let safeSql = sanitizeSQL(aiResponse.sql);

    // Step 5: Add result limit
    const maxResults = parseInt(process.env.MAX_QUERY_RESULTS || '1000');
    safeSql = validateResultLimit(safeSql, maxResults);

    console.log('Final SQL:', safeSql);

    // Step 6: Execute query
    const queryResult = await executeQuery(safeSql);

    console.log('Query executed successfully:', {
      rowCount: queryResult.rowCount,
      executionTime: Date.now() - startTime
    });

    // Step 7: Build response
    return res.status(200).json({
      success: true,
      data: queryResult,
      metadata: {
        executionTime: Date.now() - startTime,
        generatedSQL: safeSql,
        role: userRole,
        timestamp: new Date().toISOString(),
        explanation: aiResponse.explanation,
        confidence: aiResponse.confidence,
      },
    });
  } catch (error) {
    console.error('Query processing error:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
