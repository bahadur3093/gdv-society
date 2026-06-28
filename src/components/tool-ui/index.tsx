import BlockRenderer from "./ui-dsl/BlockRenderer";
import { ToolResult } from "./ui-dsl/schema";

export function renderToolUI(_toolName: string, output: unknown) {
  const result = output as ToolResult | undefined;

  if (!result?.ui) return null;

  return <BlockRenderer block={result.ui} />;
}
