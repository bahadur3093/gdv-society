// filepath: src/app/(authenticated)/admin/chat/_components/useConversationActions.ts
"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteConversation,
  toggleConversationPin,
  updateConversationTitle,
} from "../actions";
import { toast } from "@/components/atoms/Toast";

export interface ConversationSummary {
  id: string;
  title: string | null;
  isPinned: boolean;
  updatedAt: string;
}

export type ModalKind = "DELETE" | "EDIT_TITLE" | null;

export type FlashKind = "pinned" | "unpinned";

export interface UseConversationActionsReturn {
  // Search
  query: string;
  setQuery: (q: string) => void;

  activeModal: ModalKind;
  selectedId: string | null;
  initialEditTitle: string;
  openModal: (kind: Exclude<ModalKind, null>, id: string, draft?: string | null) => void;
  closeModal: () => void;

  isDeleting: boolean;
  isEditing: boolean;
  isPinning: boolean;

  confirmDelete: () => Promise<void>;
  confirmEditTitle: (newTitle: string) => Promise<void>;

  togglePin: (id: string) => void;

  sortedConversations: ConversationSummary[];
  filteredConversations: ConversationSummary[];

  flashIds: Record<string, FlashKind>;

  activeId: string | undefined;
}

export function useConversationActions(
  conversations: ConversationSummary[],
): UseConversationActionsReturn {
  const params = useParams();
  const router = useRouter();
  const activeId = params.conversationId as string | undefined;

  const [query, setQuery] = useState("");
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialEditTitle, setInitialEditTitle] = useState<string>("");

  // Optimistic overrides
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});

  // Flash state for the recently pinned/unpinned item
  const [flashIds, setFlashIds] = useState<Record<string, FlashKind>>({});

  // Per-action pending flags (prevents collisions between delete, edit, pin)
  const [isDeleting, startDelete] = useTransition();
  const [isEditing, startEdit] = useTransition();
  const [isPinning, startPin] = useTransition();

  // Track flash timers so we can clean them up on unmount
  const flashTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(flashTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  //  Modal helpers
  // ───────────────────────────────────────────────────────────

  const openModal: UseConversationActionsReturn["openModal"] = (kind, id, draft) => {
    setSelectedId(id);
    if (kind === "EDIT_TITLE") {
      setInitialEditTitle(draft ?? "");
    }
    setActiveModal(kind);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedId(null);
    setInitialEditTitle("");
  };

  // ───────────────────────────────────────────────────────────
  //  Confirm handlers
  // ───────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!selectedId) return;

    await new Promise<void>((resolve) => {
      startDelete(async () => {
        try {
          await deleteConversation(selectedId);
          closeModal();
          if (selectedId === activeId) {
            router.push("/admin/chat");
          }
          toast.success("Successfully deleted the chat!");
          resolve();
        } catch {
          toast.error("Failed to delete conversation");
          resolve();
        }
      });
    });
  };

  const confirmEditTitle = async (newTitle: string) => {
    if (!selectedId) return;

    const trimmed = newTitle.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }

    await new Promise<void>((resolve) => {
      startEdit(async () => {
        try {
          await updateConversationTitle(selectedId, trimmed);
          closeModal();
          toast.success("Title updated");
          resolve();
        } catch {
          toast.error("Failed to update title");
          resolve();
        }
      });
    });
  };

  // ───────────────────────────────────────────────────────────
  //  Quick action: toggle pin
  // ───────────────────────────────────────────────────────────

  const togglePin = (id: string) => {
    const current =
      pinOverrides[id] ?? conversations.find((c) => c.id === id)?.isPinned ?? false;
    const next = !current;

    // Optimistic update
    setPinOverrides((prev) => ({ ...prev, [id]: next }));

    // Trigger flash
    setFlashIds((prev) => ({ ...prev, [id]: next ? "pinned" : "unpinned" }));

    // Clear existing timer if a flash is already in flight for this id
    if (flashTimersRef.current[id]) {
      clearTimeout(flashTimersRef.current[id]);
    }

    flashTimersRef.current[id] = setTimeout(() => {
      setFlashIds((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      delete flashTimersRef.current[id];
    }, 900);

    startPin(async () => {
      try {
        await toggleConversationPin(id);
        toast.success(next ? "Pinned to top" : "Unpinned");
      } catch {
        // Rollback optimistic update
        setPinOverrides((prev) => ({ ...prev, [id]: current }));
        toast.error("Failed to update pin");
      }
    });
  };

  // ───────────────────────────────────────────────────────────
  //  Derived lists
  // ───────────────────────────────────────────────────────────

  const sortedConversations = useMemo<ConversationSummary[]>(() => {
    return [...conversations]
      .map((c) => ({
        ...c,
        isPinned: pinOverrides[c.id] ?? c.isPinned,
      }))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [conversations, pinOverrides]);

  const filteredConversations = useMemo<ConversationSummary[]>(() => {
    if (!query.trim()) return sortedConversations;
    const q = query.toLowerCase();
    return sortedConversations.filter((c) =>
      (c.title ?? "").toLowerCase().includes(q),
    );
  }, [sortedConversations, query]);

  return {
    query,
    setQuery,
    activeModal,
    selectedId,
    initialEditTitle,
    openModal,
    closeModal,
    isDeleting,
    isEditing,
    isPinning,
    confirmDelete,
    confirmEditTitle,
    togglePin,
    sortedConversations,
    filteredConversations,
    flashIds,
    activeId,
  };
}