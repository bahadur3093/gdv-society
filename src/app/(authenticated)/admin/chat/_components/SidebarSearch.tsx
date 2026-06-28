// filepath: src/app/(authenticated)/admin/chat/_components/SidebarSearch.tsx
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SidebarSearch({ value, onChange }: Props) {
  return (
    <div className="px-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search conversations..."
          className={cn(
            "w-full h-10 pl-10 pr-3",
            "bg-bg-sunken border border-border-subtle rounded-xl",
            "text-body-sm text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
            "focus:border-brand-primary",
          )}
        />
      </div>
    </div>
  );
}