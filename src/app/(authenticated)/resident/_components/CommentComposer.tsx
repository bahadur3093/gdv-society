"use client";

import { useState, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import { addRequestComment } from "@/lib/helpdesk/actions";

export default function CommentComposer({
  requestId,
  disabled = false,
}: {
  requestId: string;
  disabled?: boolean;
}) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await addRequestComment({
        requestId,
        content: content.trim(),
      });

      if (res.ok) {
        setContent("");
      } else {
        toast.error(res.error);
      }
    });
  };

  if (disabled) {
    return (
      <div className="text-center py-3 text-body-sm text-text-muted italic">
        Replies are closed for this request.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        className={cn(
          "w-full pl-3 pr-12 py-2.5 rounded-2xl",
          "bg-bg-sunken border border-border-default",
          "text-body-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          "resize-none",
        )}
      />
      <button
        type="submit"
        disabled={!content.trim() || isPending}
        className={cn(
          "absolute right-2 bottom-3",
          "w-9 h-9 rounded-xl",
          "bg-brand-primary text-white",
          "inline-flex items-center justify-center",
          "shadow-md shadow-brand-primary/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95 transition-transform",
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}
