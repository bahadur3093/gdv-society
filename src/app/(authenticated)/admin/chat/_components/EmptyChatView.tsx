"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { revalidateChatLayout } from "../actions";
import ModelPicker from "./ModelPicker";
import { DEFAULT_MODEL_ID } from "@/lib/chat/models";

const SUGGESTIONS = [
  "Show pending users",
  "Top defaulters",
  "This month expenses",
  "List all villas",
];

export default function EmptyChatView() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isCreating, startTransition] = useTransition();
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    const saved = localStorage.getItem("chat-model");
    if (saved) setModel(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-model", model);
  }, [model]);

  const createConversation = (message: string) => {
    if (!message.trim() || isCreating) return;
    const finalMessage = message.trim();

    startTransition(async () => {
      const res = await fetch("/api/admin/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstMessage: finalMessage }),
      });

      if (!res.ok) {
        console.error("Failed to create conversation");
        return;
      }

      const { conversationId } = await res.json();
      await revalidateChatLayout();
      router.push(
        `/admin/chat/${conversationId}?initial=${encodeURIComponent(finalMessage)}`,
      );
    });
  };

  return (
    <main className="flex-1 flex flex-col bg-bg-elevated/30 border border-border-default rounded-xl overflow-hidden relative">
      {/* Header — model label */}
      <header
        className={cn(
          "h-16 flex items-center justify-between gap-3 px-5",
          "border-b border-border-subtle",
          "bg-bg-elevated/80 backdrop-blur-md",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-h4 font-semibold text-text-primary truncate">
            New chat
          </h2>
          <ModelPicker value={model} onChange={setModel} />
        </div>
      </header>

      {/* Hero centered state */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl mb-6",
            "bg-(image:--gradient-brand)",
            "flex items-center justify-center",
            "shadow-xl shadow-brand-primary/30",
          )}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-h2 font-bold text-text-primary mb-2">
          How can I help you today?
        </h1>
        <p className="text-body-lg text-text-secondary max-w-md">
          Ask about residents, bills, expenses, or anything in the society
          database.
        </p>
      </div>

      {/* Sticky bottom input */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-2 bg-linear-to-t from-bg-base via-bg-base/95 to-transparent pointer-events-none">
        <div className="max-w-200 mx-auto pointer-events-auto space-y-3">
          {/* Suggestions */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => createConversation(s)}
                disabled={isCreating}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full",
                  "bg-bg-elevated border border-border-subtle",
                  "text-body-sm text-text-secondary",
                  "hover:text-brand-primary hover:border-brand-primary/40",
                  "transition-colors font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createConversation(input);
            }}
            className="relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or command..."
              disabled={isCreating}
              autoFocus
              className={cn(
                "w-full h-14 pl-5 pr-14",
                "bg-bg-sunken border border-border-default rounded-2xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                "focus:border-brand-primary",
                "shadow-2xl",
                "disabled:opacity-50",
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isCreating}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "inline-flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-brand-primary text-white",
                "shadow-lg shadow-brand-primary/30",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all",
              )}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="text-center text-micro text-text-muted">
            Society AI can make mistakes. Verify critical financial data.
          </p>
        </div>
      </div>
    </main>
  );
}
