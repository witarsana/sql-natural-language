import { describe, it, expect } from "@jest/globals";
import { validateQuery } from "../api/lib/query-validator";

describe("validateQuery", () => {
  it("should be valid when cemetery is mentioned in the current question", () => {
    const question = "Show me occupied plots in Astana Tegal Gundul";
    const result = validateQuery(question);
    expect(result.isValid).toBe(true);
  });

  it("should be valid when cemetery is mentioned in the conversation history", () => {
    const question = "How about vacant plots?";
    const conversationHistory = [
      { role: "user", text: "Show me occupied plots in Astana Tegal Gundul" },
      {
        role: "assistant",
        text: "Sure, here are the occupied plots in Astana Tegal Gundul",
      },
    ];
    const result = validateQuery(question, conversationHistory);
    expect(result.isValid).toBe(true);
  });

  it("should be invalid when cemetery is not mentioned", () => {
    const question = "Show me occupied plots";
    const result = validateQuery(question);
    expect(result.isValid).toBe(false);
    expect(result.missingContext).toEqual([
      {
        field: "cemetery",
        message: "Which cemetery would you like to search in?",
        suggestions: [
          "All cemeteries",
          "Astana Tegal Gundul",
          "Demo Bali Office",
          "Auckland Memorial Park Cemetery",
        ],
      },
    ]);
  });
});
