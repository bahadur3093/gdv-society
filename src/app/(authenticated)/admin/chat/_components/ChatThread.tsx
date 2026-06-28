"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { revalidateChatLayout } from "../actions";
import { DEFAULT_MODEL_ID } from "@/lib/chat/models";
import ModelPicker from "./ModelPicker";
import MessageBubble from "@/components/chat/MessageBubble";

type MessagePart = {
  type: string;
  text?: string;
  output?: unknown;
};

interface InitialMessage {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: string; [k: string]: unknown }>;
}

interface Props {
  conversationId: string;
  initialMessages: InitialMessage[];
}

const SUGGESTIONS = [
  "Show pending users",
  "Top defaulters",
  "This month expenses",
  "Vendor due dates",
];

export default function ChatThread({ conversationId, initialMessages }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMessageSent = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const [model, setModel] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_MODEL_ID;
    return localStorage.getItem("chat-model") ?? DEFAULT_MODEL_ID;
  });

  const modelRef = useRef(model);
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: conversationId,
    messages: initialMessages as any,
    transport: new DefaultChatTransport({
      api: `/api/admin/chat/${conversationId}/message`,
      body: () => ({ model }),
    }),
  });

  useEffect(() => {
    localStorage.setItem("chat-model", model);
  }, [model]);

  // Auto-send initial
  useEffect(() => {
    const initial = searchParams.get("initial");
    if (
      initial &&
      !initialMessageSent.current &&
      initialMessages.length === 0
    ) {
      initialMessageSent.current = true;
      sendMessage({ text: initial });
      router.replace(`/admin/chat/${conversationId}`);
    }
  }, [
    searchParams,
    sendMessage,
    conversationId,
    initialMessages.length,
    router,
  ]);

  useEffect(() => {
    if (status !== "streaming") return;
    let raf: number;
    const tick = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // Auto-scroll

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    if (status === "streaming") return;
    sendMessage({ text });
  };

  return (
    <main className="flex-1 flex flex-col bg-bg-elevated/30 border border-border-default md:rounded-xl overflow-hidden relative">
      {/* Header */}
      <header
        className={cn(
          "flex items-center justify-between gap-3",
          "h-14 md:h-16 px-3 md:px-5",
          "border-b border-border-subtle",
          "bg-bg-elevated/80 backdrop-blur-md",
          "sticky top-0 z-10",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-h4 font-semibold text-text-primary truncate">
            Conversation
          </h2>
          <ModelPicker value={model} onChange={setModel} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* <IconBtn icon={<Share2 className="w-4 h-4" />} label="Share" /> */}
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this conversation?")) return;
              const res = await fetch(`/api/admin/chat/${conversationId}`, {
                method: "DELETE",
              });
              if (res.ok) {
                await revalidateChatLayout();
                router.push("/admin/chat");
              }
            }}
            title="Delete"
            aria-label="Delete"
            className="p-2 rounded-lg text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto scroll-smooth",
          "p-3 md:p-6 space-y-4 md:space-y-6",
          "pb-32 md:pb-44",
        )}
      >
        {messages.map((m, idx) => {
          const prevSameAuthor = idx > 0 && messages[idx - 1].role === m.role;

          return (
            <MessageBubble
              key={m.id}
              role={m.role as "user" | "assistant"}
              parts={m.parts as any}
              hideAvatar={prevSameAuthor}
              onCopy={() => {
                const text = extractText({ parts: m.parts as any });
                navigator.clipboard.writeText(text);
              }}
              onRegenerate={() => {
                // optional: trigger sendMessage with last user input
              }}
              onThumb={(value) => {
                console.log("feedback", value, m.id);
              }}
            />
          );
        })}

        {status === "streaming" && (
          <MessageBubble role="assistant" parts={[]} isStreaming />
        )}

        {error && (
          <div className="rounded-md bg-danger/15 border border-danger/30 p-3 text-danger text-body-sm">
            {error.message}
          </div>
        )}
      </div>

      {/* Sticky input area */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-2 bg-linear-to-t from-bg-base via-bg-base/95 to-transparent pointer-events-none">
        <div className="max-w-200 mx-auto pointer-events-auto space-y-3">
          {messages.length === 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  disabled={status === "streaming"}
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
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or command..."
              disabled={status === "streaming"}
              autoFocus
              className={cn(
                "w-full h-14 pl-5 pr-14",
                "h-12 md:h-14",
                "bg-bg-sunken border border-border-default rounded-2xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
                "shadow-2xl",
                "disabled:opacity-50",
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || status === "streaming"}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "inline-flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-brand-primary text-white",
                "shadow-lg shadow-brand-primary/30",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "transition-all",
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function SmallBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-sunken text-micro transition-colors"
    >
      {icon}
    </button>
  );
}

export function extractText(message: { parts?: MessagePart[] }): string {
  if (!message.parts) return "";

  return message.parts
    .filter((p) => p.type === "text" || p.type === "text-delta")
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}
