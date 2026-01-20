import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  queryRequestSchema,
  QueryRequest,
  QueryResponse,
  UserRole,
} from "../models/query.model";
import { logger } from "../utils/logger";
import { queryBuilderService } from "../services/query-builder.service";
import { databaseService } from "../services/database.service";
import { queryValidatorService } from "../services/query-validator.service";
import { SQLSanitizer } from "../utils/sql-sanitizer";

export default async function queryRoutes(fastify: FastifyInstance) {
  // Main query endpoint
  fastify.post<{ Body: QueryRequest }>(
    "/query",
    {
      schema: {
        body: {
          type: "object",
          required: ["question"],
          properties: {
            question: { type: "string", minLength: 1, maxLength: 500 },
            role: {
              type: "string",
              enum: ["Admin", "Sales", "Operations", "Management"],
            },
            sessionId: { type: "string" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: QueryRequest }>,
      reply: FastifyReply,
    ) => {
      const startTime = Date.now();

      try {
        // Validate request body
        const validatedData = queryRequestSchema.parse(request.body);

        logger.info("Query request received:", {
          question: validatedData.question,
          role: validatedData.role,
          sessionId: validatedData.sessionId,
        });

        // Step 1: Validate if query has sufficient context (check conversation history)
        const validation = queryValidatorService.validateQuery(
          validatedData.question,
          validatedData.conversationHistory as any,
        );

        if (!validation.isValid && validation.missingContext) {
          const clarificationPrompt =
            queryValidatorService.buildClarificationPrompt(
              validation.missingContext,
            );

          const response: QueryResponse = {
            success: false,
            needsClarification: true,
            clarificationPrompt,
            missingContext: validation.missingContext,
            metadata: {
              executionTime: Date.now() - startTime,
              role: validatedData.role || UserRole.ADMIN,
              timestamp: new Date().toISOString(),
            },
          };

          logger.info("Query needs clarification:", {
            question: validatedData.question,
            missingContext: validation.missingContext,
          });

          return reply.status(200).send(response);
        }

        // Step 2: Build and validate SQL query using AI with conversation context
        const aiResponse = await queryBuilderService.buildQuery(
          validatedData.question,
          validatedData.role,
          validatedData.conversationHistory as any,
        );

        // Step 3: Additional sanitization and validation
        let sanitizedSQL: string;
        try {
          sanitizedSQL = SQLSanitizer.sanitizeSQL(aiResponse.sql);
        } catch (sanitizeError: any) {
          logger.error("SQL sanitization failed:", {
            error: sanitizeError.message,
            sql: aiResponse.sql,
          });

          // Return user-friendly error
          const response: QueryResponse = {
            success: false,
            error: `Query validation failed: ${sanitizeError.message}. Please try rephrasing your question.`,
            metadata: {
              executionTime: Date.now() - startTime,
              generatedSQL: aiResponse.sql,
              role: validatedData.role || UserRole.ADMIN,
              timestamp: new Date().toISOString(),
            },
          };
          return reply.status(200).send(response);
        }

        // Step 4: Execute query
        let queryResult;
        try {
          queryResult = await databaseService.executeQuery(sanitizedSQL);
        } catch (dbError: any) {
          logger.error("Database query execution failed:", {
            error: dbError.message,
            sql: sanitizedSQL,
          });

          // Provide user-friendly error message
          let errorMessage = "Failed to execute query. ";
          if (dbError.message?.includes("Unknown column")) {
            errorMessage +=
              "The query referenced a field that doesn't exist in the database.";
          } else if (dbError.message?.includes("syntax")) {
            errorMessage += "The generated SQL has a syntax error.";
          } else {
            errorMessage += "Please try rephrasing your question.";
          }

          const response: QueryResponse = {
            success: false,
            error: errorMessage,
            metadata: {
              executionTime: Date.now() - startTime,
              generatedSQL: sanitizedSQL,
              role: validatedData.role || UserRole.ADMIN,
              timestamp: new Date().toISOString(),
              explanation: "Query failed to execute due to database error",
            },
          };
          return reply.status(200).send(response);
        }

        // Step 5: Build response
        const response: QueryResponse = {
          success: true,
          data: queryResult,
          metadata: {
            executionTime: Date.now() - startTime,
            generatedSQL: sanitizedSQL,
            role: validatedData.role || UserRole.ADMIN,
            timestamp: new Date().toISOString(),
            explanation: aiResponse.explanation,
            confidence: aiResponse.confidence,
          },
        };

        logger.info("Query completed successfully:", {
          rowCount: queryResult.rowCount,
          executionTime: response.metadata.executionTime,
          confidence: aiResponse.confidence,
        });

        return reply.status(200).send(response);
      } catch (error) {
        logger.error("Query request failed:", error);
        throw error;
      }
    },
  );

  // Get example queries endpoint
  fastify.get(
    "/examples",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const examples = [
        {
          category: "Plot Availability",
          queries: [
            "Show me all available plots in section A",
            "How many empty plots are in section B?",
            "List all family plots that are available",
          ],
        },
        {
          category: "Occupancy",
          queries: [
            "Which plots are currently occupied?",
            "Show me all graves in section C",
            "List all deceased persons buried in 2024",
          ],
        },
        {
          category: "Reservations",
          queries: [
            "Show all reserved plots",
            "Which plots have active reservations?",
            "List reservations expiring this month",
          ],
        },
        {
          category: "Statistics",
          queries: [
            "How many available plots do we have in total?",
            "What is the occupancy rate by section?",
            "Show me the most expensive available plots",
          ],
        },
        {
          category: "Search",
          queries: [
            "Find person named John Smith",
            "Show all plots in row 5",
            "List all plots larger than 15 square meters",
          ],
        },
      ];

      return reply.status(200).send({
        success: true,
        examples,
      });
    },
  );

  // Get schema information endpoint
  fastify.get(
    "/schema",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const schemaInfo = {
        tables: [
          {
            name: "plots",
            description: "Cemetery plot information",
            commonFields: [
              "plot_id",
              "plot_number",
              "plot_section_id",
              "plot_status_id",
              "plot_area",
            ],
          },
          {
            name: "graves",
            description: "Burial records",
            commonFields: [
              "grave_id",
              "grave_plot_id",
              "grave_person_id",
              "grave_burial_date",
            ],
          },
          {
            name: "persons",
            description: "Deceased and contact persons",
            commonFields: [
              "person_id",
              "person_first_name",
              "person_last_name",
              "person_date_of_death",
            ],
          },
          {
            name: "sections",
            description: "Cemetery sections",
            commonFields: ["section_id", "section_name", "section_capacity"],
          },
          {
            name: "plot_statuses",
            description: "Plot status types",
            commonFields: ["plot_status_id", "plot_status_name"],
          },
        ],
        commonTerms: {
          available: "Plots with status 'Available'",
          occupied: "Plots with burial records",
          empty: "Plots without burial records",
          reserved: "Plots with active reservations",
          familyPlot: "Plots with area >= 10 or width >= 3",
        },
      };

      return reply.status(200).send({
        success: true,
        schema: schemaInfo,
      });
    },
  );
}
