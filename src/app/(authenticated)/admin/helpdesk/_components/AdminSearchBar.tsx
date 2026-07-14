"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export default function AdminSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const applySearch = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) {
      params.set("q", next.trim());
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.push("/admin/helpdesk?" + params.toString());
    });
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") applySearch(value);
        }}
        placeholder="Search by resident, plot, or description..."
        className={cn(
          "w-full h-10 pl-10 pr-10 rounded-lg",
          "bg-bg-sunken border border-border-subtle",
          "text-body-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            applySearch("");
          }}
          disabled={isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-bg-elevated text-text-muted"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
