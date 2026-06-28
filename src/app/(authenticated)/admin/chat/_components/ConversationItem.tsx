// filepath: src/app/(authenticated)/admin/chat/_components/ConversationItem.tsx
"use client";

import Link from "next/link";
import { MessageCircle, History, Edit3, Share2, Pin, Trash2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, truncate } from "@/lib/utils/utils";
import Tooltip from "@/components/atoms/Tooltip";
import Menu from "@/components/atoms/Menu";
import {
  itemVariants,
  layoutTransition,
  pinIconTransition,
  pinFlashVariants,
} from "./chatAnimations";
import type { FlashKind } from "./useConversationActions";
import { timeAgo } from "./timeAgo";

export interface ConversationItemData {
  id: string;
  title: string | null;
  isPinned: boolean;
  updatedAt: string;
}

interface Props {
  conversation: ConversationItemData;
  isActive: boolean;
  flash?: FlashKind;
  onEditTitle: (id: string, currentTitle: string | null) => void;
  onTogglePin: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

export default function ConversationItem({
  conversation: c,
  isActive,
  flash,
  onEditTitle,
  onTogglePin,
  onRequestDelete,
}: Props) {
  const Icon = isActive ? MessageCircle : History;

  return (
    <motion.div
      key={c.id}
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={layoutTransition}
      className="rounded-xl"
    >
      <motion.div
        animate={flash ?? undefined}
        variants={flash ? pinFlashVariants : undefined}
        className="rounded-xl"
      >
        <Link
          href={`/admin/chat/${c.id}`}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-xl",
            "transition-colors group",
            isActive
              ? "bg-bg-sunken border-r-2 border-brand-primary shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]"
              : "hover:bg-bg-sunken/60",
          )}
        >
          <div className="flex items-center grow">
            <Icon
              className={cn(
                "w-5 h-5 shrink-0 mr-2",
                isActive
                  ? "text-brand-primary"
                  : "text-text-muted group-hover:text-text-primary",
              )}
            />
            <div className="flex-1 min-w-0">
              <Tooltip label={c.title || "No title"}>
                <p
                  className={cn(
                    "text-body-sm font-medium truncate flex items-center gap-1.5",
                    isActive
                      ? "text-brand-primary font-semibold"
                      : "text-text-primary",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {c.isPinned && (
                      <motion.span
                        key="pin-icon"
                        initial={{ scale: 0, rotate: -45, width: 0 }}
                        animate={{ scale: 1, rotate: 0, width: "auto" }}
                        exit={{ scale: 0, rotate: -45, width: 0 }}
                        transition={pinIconTransition}
                        className="shrink-0 inline-flex"
                      >
                        <Pin
                          className={cn(
                            "w-3 h-3 fill-current",
                            isActive ? "text-brand-primary" : "text-text-muted",
                          )}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="truncate">
                    {truncate(c.title || "Untitled", 16)}
                  </span>
                </p>
              </Tooltip>
              <p className="text-micro text-text-muted truncate">
                {timeAgo(c.updatedAt)}
              </p>
            </div>
          </div>

          <Menu
            trigger={
              <button
                type="button"
                aria-label="Conversation actions"
                className="p-2 rounded-lg hover:bg-bg-sunken text-text-muted"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            options={[
              {
                key: "edit",
                label: "Edit title",
                icon: <Edit3 />,
                onClick: () => onEditTitle(c.id, c.title),
              },
              {
                key: "share",
                label: "Share",
                icon: <Share2 />,
                onClick: () => console.log("Share", c.id),
              },
              {
                key: "pin",
                label: c.isPinned ? "Unpin" : "Pin",
                icon: <Pin />,
                onClick: () => onTogglePin(c.id),
              },
              {
                key: "delete",
                label: "Delete",
                icon: <Trash2 />,
                onClick: () => onRequestDelete(c.id),
                divider: true,
                danger: true,
              },
            ]}
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}