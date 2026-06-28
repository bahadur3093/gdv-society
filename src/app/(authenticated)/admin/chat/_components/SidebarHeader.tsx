// filepath: src/app/(authenticated)/admin/chat/_components/SidebarHeader.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Tooltip from "@/components/atoms/Tooltip";

export default function SidebarHeader() {
  return (
    <div className="flex items-center">
      <div className="p-5 flex flex-col gap-0.5 grow">
        <h1 className="text-h3 font-bold text-brand-primary">Society AI</h1>
        <p className="text-body-sm text-text-muted">Management Portal</p>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <Tooltip label="New Session">
          <Link
            href={"/admin/chat"}
            className={cn(
              "w-9 h-9 rounded-full text-white",
              "inline-flex items-center justify-center gap-2",
              "font-semibold text-body-sm",
              "bg-(image:--gradient-brand)",
              "shadow-lg shadow-brand-primary/20",
              "hover:opacity-95 active:scale-95",
              "transition-all",
            )}
          >
            <Plus className="w-4 h-4" />
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}