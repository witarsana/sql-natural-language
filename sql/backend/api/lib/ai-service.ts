// Simplified AI Service for serverless
export enum UserRole {
  ADMIN = "Admin",
  SALES = "Sales",
  OPERATIONS = "Operations",
  MANAGEMENT = "Management",
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

// Simplified system prompt (key parts only to save space)
function getSystemPrompt(role: UserRole): string {
  return `You are a SQL query generator for Chronicle cemetery management system.

## DATABASE SCHEMA
Main tables: cemeteries_plot, cemeteries_intermentrecord, cemeteries_person,
cemeteries_section, cemeteries_applicationrecord, cemeteries_cemetery

## CRITICAL RULES
1. ONLY generate SELECT queries
2. Always filter deleted: WHERE deleted_at IS NULL AND is_deleted = 0
3. Use exact field names from schema
4. Plot status values: 'Vacant', 'Occupied', 'Reserved', 'For Sale'

## RESPONSE FORMAT
Return JSON:
{
  "sql": "SELECT ...",
  "explanation": "Natural language explanation with comma-formatted numbers",
  "confidence": "high|medium|low"
}

Current user role: ${role}

Generate query for user's question. Return ONLY JSON, no extra text.`;
}

export async function healthCheck(): Promise<boolean> {
  return !!process.env.OPENROUTER_API_KEY;
}
