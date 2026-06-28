"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import ChatSidebar from "./ChatSidebar";
import type { ConversationSummary } from "./useConversationActions";

interface Props {
  conversations: ConversationSummary[];
  children: React.ReactNode;
}

export default function ChatShell({ conversations, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Auto-close drawer on route change (mobile)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // ✅ Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div
      className={cn(
        "flex gap-4 relative",
        "h-[calc(100dvh-128px)]",
        "h-[calc(100dvh-128px)]",
      )}
    >
      {/* ─── Mobile top bar ─── */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 h-12 rounded-xl">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open chat list"
          className="p-2 rounded-lg hover:bg-bg-sunken text-text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-body-sm font-semibold text-text-primary">
          Society AI
        </h2>
        <div className="w-9" /> {/* spacer for symmetry */}
      </div>

      {/* ─── Sidebar (desktop) ─── */}
      <div className="hidden md:flex">
        <ChatSidebar conversations={conversations} />
      </div>

      {/* ─── Sidebar (mobile drawer) ─── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
          />
          {/* Drawer */}
          <div
            className={cn(
              "md:hidden fixed top-0 left-0 bottom-0 z-50",
              "w-[85%] max-w-[320px]",
              "animate-in slide-in-from-left duration-200",
            )}
          >
            <div className="h-full relative">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute bottom-3 right-3 z-10 p-2 rounded-lg bg-bg-sunken/80 text-text-muted hover:text-text-primary"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <ChatSidebar conversations={conversations} />
            </div>
          </div>
        </>
      )}

      {/* ─── Main panel ─── */}
      <main
        className={cn(
          "flex-1 min-w-0 flex flex-col",
          // Reserve space for mobile top bar
          "pt-12 md:pt-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
