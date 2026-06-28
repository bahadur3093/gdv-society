"use client";

import { ReactNode } from "react";
import {
  Sparkles,
  User as UserIcon,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import MessageParts from "./MessageParts";

export interface MessageBubbleProps {
  role: "user" | "assistant";
  parts: Array<{ type: string; [k: string]: unknown }>;
  createdAt?: string | Date;
  isStreaming?: boolean;
  hideAvatar?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onThumb?: (value: "up" | "down") => void;
}

export default function MessageBubble({
  role,
  parts,
  createdAt,
  isStreaming = false,
  hideAvatar = false,
  onCopy,
  onRegenerate,
  onThumb,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 group",
        isUser ? "justify-end ml-12" : "justify-start mr-12",
      )}
    >
      {/* Avatar (assistant) */}
      {!isUser && <Avatar kind="assistant" hidden={hideAvatar} />}

      <div
        className={cn(
          "max-w-full sm:max-w-[85%] md:max-w-[80%]",
          "max-w-[80%] flex flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Header (name + time) */}
        {!hideAvatar && (
          <div
            className={cn(
              "flex items-center gap-2 text-micro text-text-muted px-1",
              isUser ? "flex-row-reverse" : "flex-row",
            )}
          >
            <span className="font-medium text-text-secondary">
              {isUser ? "You" : "Society AI"}
            </span>
            {createdAt && <span>{formatTime(createdAt)}</span>}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-md",
            isUser
              ? "bg-brand-primary/20 border border-brand-primary/30 text-text-primary rounded-tr-sm"
              : "bg-bg-elevated border border-border-subtle text-text-primary rounded-tl-sm",
            "w-full",
          )}
        >
          <MessageParts parts={parts as any} />

          {/* Streaming indicator inside bubble */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-1 text-text-muted text-body-sm">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </div>
          )}
        </div>

        {/* Actions (assistant, not streaming) */}
        {!isUser && !isStreaming && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-1",
              "opacity-0 group-hover:opacity-100 transition-opacity",
            )}
          >
            <SmallBtn
              icon={<Copy className="w-3.5 h-3.5" />}
              label="Copy"
              onClick={onCopy}
            />
            <SmallBtn
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              label="Regenerate"
              onClick={onRegenerate}
            />
            <div className="flex-1" />
            <SmallBtn
              icon={<ThumbsUp className="w-3.5 h-3.5" />}
              label="Good"
              onClick={() => onThumb?.("up")}
            />
            <SmallBtn
              icon={<ThumbsDown className="w-3.5 h-3.5" />}
              label="Bad"
              onClick={() => onThumb?.("down")}
            />
          </div>
        )}
      </div>

      {/* Avatar (user) */}
      {isUser && <Avatar kind="user" hidden={hideAvatar} />}
    </div>
  );
}

function Avatar({
  kind,
  hidden,
}: {
  kind: "user" | "assistant";
  hidden?: boolean;
}) {
  if (kind === "assistant") {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full shrink-0",
          "bg-(image:--gradient-brand)",
          "flex items-center justify-center",
          "shadow-md shadow-brand-primary/20",
          hidden && "opacity-0",
        )}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full bg-bg-sunken border border-border-subtle",
        "flex items-center justify-center text-text-muted shrink-0",
        hidden && "opacity-0",
      )}
    >
      <UserIcon className="w-4 h-4" />
    </div>
  );
}

function SmallBtn({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-sunken text-micro transition-colors"
    >
      {icon}
    </button>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function formatTime(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
