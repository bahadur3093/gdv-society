import { renderToolUI } from "../tool-ui";


interface Part {
  type: string;
  text?: string;
  output?: unknown;
  state?: string;
}

export default function MessageParts({ parts }: { parts?: Part[] }) {
  if (!parts?.length) return null;

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "text" || part.type === "text-delta") {
          return (
            <div
              key={i}
              className="text-body-sm text-text-primary whitespace-pre-wrap"
            >
              {part.text}
            </div>
          );
        }

        // ✅ TOOL
        if (part.type.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "");

          if (part.state !== "output-available") {
            return (
              <div
                key={i}
                className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 animate-pulse"
              >
                <div className="text-body-sm text-text-muted">
                  Running {toolName}…
                </div>
              </div>
            );
          }

          return <div key={i}>{renderToolUI(toolName, part.output)}</div>;
        }

        return null;
      })}
    </div>
  );
}
