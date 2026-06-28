"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Send,
  Loader2,
  Sparkles,
  User as UserIcon,
  Share2,
  Trash2,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { revalidateChatLayout } from "../actions";
import { DEFAULT_MODEL_ID } from "@/lib/chat/models";
import ModelPicker from "./ModelPicker";

interface InitialMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
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
    transport: new DefaultChatTransport({
      api: `/api/admin/chat/${conversationId}/message`,
      body: () => ({ model }),
    }),
  });

  useEffect(() => {
    localStorage.setItem("chat-model", model);
  }, [model]);

  // Hydrate from DB
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(
        initialMessages.map((m) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: "text" as const, text: m.text }],
        })),
      );
    }
  }, []); // eslint-disable-line

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
    <main className="flex-1 flex flex-col bg-bg-elevated/30 border border-border-default rounded-xl overflow-hidden relative">
      {/* Header */}
      <header
        className={cn(
          "h-16 flex items-center justify-between gap-3 px-5",
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
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-44"
      >
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          const prevSameAuthor = idx > 0 && messages[idx - 1].role === m.role;
          return (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-3",
                isUser ? "justify-end ml-12" : "justify-start mr-12",
              )}
            >
              {/* Assistant avatar (hide on grouped messages) */}
              {!isUser && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full shrink-0",
                    "bg-(image:--gradient-brand)",
                    "flex items-center justify-center",
                    "shadow-md shadow-brand-primary/20",
                    prevSameAuthor && "opacity-0",
                  )}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl shadow-md",
                  isUser
                    ? "bg-brand-primary/20 border border-brand-primary/30 text-text-primary rounded-tr-sm"
                    : "bg-bg-elevated border border-border-subtle text-text-primary rounded-tl-sm",
                )}
              >
                {(() => {
                  const text = extractText(m);
                  if (text) {
                    return (
                      <p className="text-body whitespace-pre-wrap leading-relaxed">
                        {text}
                      </p>
                    );
                  }

                  if (m.role === "assistant" && status !== "streaming") {
                    return (
                      <p className="text-body-sm text-text-muted italic">
                        I&apos;m not sure how to help with that. Try rephrasing.
                      </p>
                    );
                  }
                  return null;
                })()}

                {/* Assistant message actions */}
                {!isUser && (
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border-subtle">
                    <SmallBtn
                      icon={<Copy className="w-3.5 h-3.5" />}
                      label="Copy"
                    />
                    <SmallBtn
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      label="Regenerate"
                    />
                    <div className="flex-1" />
                    <SmallBtn
                      icon={<ThumbsUp className="w-3.5 h-3.5" />}
                      label="Good"
                    />
                    <SmallBtn
                      icon={<ThumbsDown className="w-3.5 h-3.5" />}
                      label="Bad"
                    />
                  </div>
                )}
              </div>

              {/* User avatar */}
              {isUser && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full bg-bg-sunken border border-border-subtle",
                    "flex items-center justify-center text-text-muted shrink-0",
                    prevSameAuthor && "opacity-0",
                  )}
                >
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {status === "streaming" && (
          <div className="flex items-start gap-3 mr-12">
            <div className="w-8 h-8 rounded-full bg-(image:--gradient-brand) flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-text-muted text-body-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking…
            </div>
          </div>
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

          <p className="text-center text-micro text-text-muted px-4">
            Society AI can make mistakes. Verify critical financial data.
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Small button helpers ───
function IconBtn({
  icon,
  label,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "p-2 rounded-lg transition-colors",
        danger
          ? "text-danger/70 hover:text-danger hover:bg-danger/10"
          : "text-text-muted hover:text-text-primary hover:bg-bg-sunken",
      )}
    >
      {icon}
    </button>
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

function extractText(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p) => p.type === "text" || p.type === "text-delta")
    .map((p) => p.text ?? "")
    .join("");
}
