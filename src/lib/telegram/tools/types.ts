export interface ToolDefinition {
  name: string;
  description: string;
  /** JSON schema for parameters (Groq compatible) */
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  /** Human-readable text result for the LLM to use */
  data: string;
  /** Optional error message */
  error?: string;
}

export type ToolHandler = (
  args: Record<string, unknown>,
) => Promise<ToolResult>;

export interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}
