// filepath: src/app/(authenticated)/admin/chat/_components/ChatSidebar.tsx
"use client";

import { Settings, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listContainerVariants } from "./chatAnimations";
import {
  useConversationActions,
  type ConversationSummary,
} from "./useConversationActions";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import ConversationItem from "./ConversationItem";
import DeleteConversationModal from "./DeleteConversationModal";
import EditTitleModal from "./EditTitleModal";
import { cn } from "@/lib/utils/utils";

interface Props {
  conversations: ConversationSummary[];
}

export default function ChatSidebar({ conversations }: Props) {
  const {
    query,
    setQuery,
    activeModal,
    initialEditTitle,
    openModal,
    closeModal,
    isDeleting,
    isEditing,
    confirmDelete,
    confirmEditTitle,
    togglePin,
    sortedConversations,
    filteredConversations,
    flashIds,
    activeId,
  } = useConversationActions(conversations);

  const pinnedCount = sortedConversations.filter((c) => c.isPinned).length;
  const hasPinned = pinnedCount > 0;
  const isEmpty = filteredConversations.length === 0;

  return (
    <aside
      className={cn(
        "flex flex-col bg-bg-elevated/40 border border-border-default rounded-xl overflow-hidden",
        "w-full md:w-72 shrink-0",
        "h-full",
      )}
    >
      <SidebarHeader />

      <SidebarSearch value={query} onChange={setQuery} />

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-micro uppercase tracking-wider text-text-muted font-medium">
            {hasPinned ? "Pinned" : "Recent"}
          </span>
          {hasPinned && (
            <span className="text-micro text-text-muted">
              {pinnedCount} pinned
            </span>
          )}
        </div>

        {isEmpty ? (
          <p className="text-body-sm text-text-muted px-3 py-3">
            {query ? "No matches" : "No conversations yet"}
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={listContainerVariants}
          >
            <AnimatePresence initial={false}>
              {filteredConversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isActive={c.id === activeId}
                  flash={flashIds[c.id]}
                  onEditTitle={(id, title) =>
                    openModal("EDIT_TITLE", id, title)
                  }
                  onTogglePin={togglePin}
                  onRequestDelete={(id) => openModal("DELETE", id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-subtle space-y-0.5">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-sunken/60 text-body-sm transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-sunken/60 text-body-sm transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Modals */}
      <DeleteConversationModal
        open={activeModal === "DELETE"}
        isPending={isDeleting}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />

      <EditTitleModal
        open={activeModal === "EDIT_TITLE"}
        isPending={isEditing}
        initialTitle={initialEditTitle}
        onClose={closeModal}
        onConfirm={confirmEditTitle}
      />
    </aside>
  );
}
