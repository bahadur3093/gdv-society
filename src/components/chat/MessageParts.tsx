import { renderToolUI } from "../tool-ui";


interface Part {
  type: string;
  text?: string;
  output?: unknown;
  state?: string;
}

export default function MessageParts({
  parts,
}: {
  parts?: Part[];
}) {
  if (!parts?.length) return null;

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        // ✅ TEXT
        if (part.type === "text" || part.type === "text-delta") {
          return (
            <p
              key={i}
              className="text-body-sm text-text-primary whitespace-pre-wrap"
            >
              {part.text}
            </p>
          );
        }

        // ✅ TOOL OUTPUT
        if (part.type.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "");

          // Show loading skeleton until output available
          if (part.state !== "output-available") {
            return (
              <div
                key={i}
                className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 animate-pulse"
              >
                <p className="text-body-sm text-text-muted">
                  Running {toolName}…
                </p>
              </div>
            );
          }

          return (
            <div key={i}>{renderToolUI(toolName, part.output)}</div>
          );
        }

        return null;
      })}
    </div>
  );
}