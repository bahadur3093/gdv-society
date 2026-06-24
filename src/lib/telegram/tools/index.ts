import { listPendingTool } from "./list-pending";
import { listUnpaidTool } from "./list-unpaid";
import { societyStatsTool } from "./society-stats";
import { lookupResidentTool } from "./lookup-resident";
import { lookupVillaTool } from "./lookup-villa";
import type { RegisteredTool, ToolResult } from "./types";

const TOOLS: RegisteredTool[] = [
  listPendingTool,
  listUnpaidTool,
  societyStatsTool,
  lookupResidentTool,
  lookupVillaTool,
];

const TOOLS_BY_NAME = new Map(TOOLS.map((t) => [t.definition.name, t]));

/**
 * Tool definitions in Groq/OpenAI format.
 * LLM uses these to decide which tool to call.
 */
export function getToolDefinitions() {
  return TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.definition.name,
      description: t.definition.description,
      parameters: t.definition.parameters,
    },
  }));
}

/**
 * Execute a tool by name with arguments.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const tool = TOOLS_BY_NAME.get(name);
  if (!tool) {
    return {
      success: false,
      data: "",
      error: `Tool "${name}" not found`,
    };
  }

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "telegram_tool_call",
      tool: name,
      args,
    }),
  );

  return tool.handler(args);
}

export type { ToolResult } from "./types";
