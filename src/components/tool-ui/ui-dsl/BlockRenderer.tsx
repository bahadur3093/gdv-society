import ToolCard from "../ToolCard";
import EmptyState from "../primitives/EmptyState";
import { Home } from "lucide-react";
import { UIBlock } from "./schema";
import StatPill from "../primitives/StatPill";
import DataList from "../primitives/DataList";
import DataRow from "../primitives/DataRow";


export default function BlockRenderer({ block }: { block: UIBlock }) {
  switch (block.type) {
    case "card":
      return (
        <ToolCard title={block.title} icon={<Home />}>
          {block.blocks.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </ToolCard>
      );

    case "stat-grid":
      return (
        <div className="grid grid-cols-2 gap-2">
          {block.items.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </div>
      );

    case "stat":
      return <StatPill {...block} />;

    case "list":
      return (
        <DataList>
          {block.items.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </DataList>
      );

    case "row":
      return (
        <DataRow
          label={block.label}
          value={
            <span className="flex items-center gap-2">
              {block.value}
              {block.badge && <div>{block.badge.text}</div>}
            </span>
          }
        />
      );

    case "empty":
      return <EmptyState message={block.message} />;

    case "text":
      return (
        <p className={block.tone === "default" ? "text-text-muted" : ""}>
          {block.text}
        </p>
      );

    default:
      return null;
  }
}
