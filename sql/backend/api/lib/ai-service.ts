// AI Service for serverless - uses generated schema constant
import { DATABASE_SCHEMA } from './generated-schema';

export enum UserRole {
  ADMIN = "Admin",
  SALES = "Sales",
  OPERATIONS = "Operations",
  MANAGEMENT = "Management",
}

// Use the generated schema constant (embedded at build time)
function getDatabaseSchema(): string {
  return DATABASE_SCHEMA;
}

export interface AIResponse {
  sql: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

export async function generateSQL(
  question: string,
  role?: UserRole
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY!;
  const effectiveRole = role || UserRole.ADMIN;

  // Get system prompt (simplified version - full prompt is too large)
  const systemPrompt = getSystemPrompt(effectiveRole);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://chloe-backend.vercel.app",
      "X-Title": "Chronicle NL Query System",
    },
    body: JSON.stringify({
      model: "tngtech/deepseek-r1t2-chimera:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as any;

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response structure from OpenRouter");
  }

  const responseText = data.choices[0].message.content?.trim();
  if (!responseText) {
    throw new Error("Empty response from OpenRouter");
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(responseText);
    return {
      sql: parsed.sql,
      explanation: parsed.explanation,
      confidence: parsed.confidence || "medium",
    };
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${responseText.substring(0, 200)}`);
  }
}

// Complete system prompt with full DATABASE_SCHEMA.md
function getSystemPrompt(role: UserRole): string {
  return `You are a SQL query generator for Chronicle, a cemetery management system. Your task is to convert natural language questions into MySQL SELECT queries.

## DATABASE SCHEMA

${getDatabaseSchema()}

## STRICT FIELD USAGE RULES

1. **ONLY use fields documented in the DATABASE SCHEMA above** - Every field you use must appear exactly as listed in the schema tables
2. **NEVER invent or assume field names** - If a field isn't listed in the schema, it doesn't exist in the database
3. **Field names must match EXACTLY** - Including capitalization, underscores, and spelling
4. **When in doubt, use fewer fields** - It's better to omit a field than to guess or invent one
5. **If a reasonable field seems missing** - Mention this limitation in your explanation, but never invent the field

## CRITICAL RULES

1. **ONLY generate SELECT queries** - Never DELETE, INSERT, UPDATE, DROP, or any other modification

2. **Soft Delete Filtering - ONLY for these specific tables**:
   - **cemeteries_plot**: Add \`WHERE deleted_at IS NULL AND is_deleted = 0\`
   - **cemeteries_person**: Add \`WHERE deleted_at IS NULL AND is_deleted = 0\`
   - **cemeteries_business**: Add \`WHERE deleted_at IS NULL AND is_deleted = 0\`
   - **cemeteries_events**: Add \`WHERE is_deleted = 0\`
   - **cemeteries_cemetery**: Add \`WHERE deleted = 0\` (note: column is 'deleted', not 'is_deleted')

   **IMPORTANT**: Other tables like cemeteries_intermentrecord, cemeteries_applicationrecord, cemeteries_section, cemeteries_lot, etc. do NOT have soft delete columns. Do NOT add deleted_at or is_deleted filters to these tables!

3. **Use exact field names from schema above** - No invented or assumed fields. If a column doesn't exist in the schema, don't use it.

4. **Plot status values (EXACT)**: 'Vacant', 'Occupied', 'Unavailable', 'Reserved', 'Interest', 'For Sale'

## NATURAL LANGUAGE MAPPINGS

- "occupied plots" = status = 'Occupied' OR EXISTS (SELECT 1 FROM cemeteries_intermentrecord WHERE plot_id = cemeteries_plot.id)
- "available plots" = status = 'Vacant' OR status = 'For Sale'
- "family plot" = (total_capacity >= 4 OR burials_capacity >= 4)

## RESPONSE FORMAT
Return JSON only:
{
  "sql": "SELECT ... (complete valid MySQL query)",
  "explanation": "Natural language explanation with comma-formatted numbers",
  "confidence": "high|medium|low"
}

Current user role: ${role}

Generate query for the user's question. Return ONLY the JSON object, no additional text.`;
}

export async function healthCheck(): Promise<boolean> {
  return !!process.env.OPENROUTER_API_KEY;
}
