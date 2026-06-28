// filepath: src/app/(authenticated)/admin/chat/_components/chatAnimations.ts
import type { Variants, Transition } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  Brand color tokens (kept in sync with tailwind theme)
// ─────────────────────────────────────────────────────────────

export const PIN_FLASH_COLOR = "rgba(139, 92, 246, 0.18)"; // brand violet @ 18%
export const PIN_FLASH_TRANSPARENT = "rgba(139, 92, 246, 0)";

// ─────────────────────────────────────────────────────────────
//  Item entrance / exit
// ─────────────────────────────────────────────────────────────

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

// ─────────────────────────────────────────────────────────────
//  Reorder transition (used when pin/unpin changes order)
// ─────────────────────────────────────────────────────────────

export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

// ─────────────────────────────────────────────────────────────
//  Pin icon pop animation (used inside ConversationItem)
// ─────────────────────────────────────────────────────────────

export const pinIconTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 20,
};

// ─────────────────────────────────────────────────────────────
//  Flash highlight on the row when its pin state changes
// ─────────────────────────────────────────────────────────────

export const pinFlashVariants: Variants = {
  pinned: {
    backgroundColor: [
      PIN_FLASH_TRANSPARENT,
      PIN_FLASH_COLOR,
      PIN_FLASH_TRANSPARENT,
    ],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  unpinned: {
    backgroundColor: [
      PIN_FLASH_TRANSPARENT,
      PIN_FLASH_TRANSPARENT,
      PIN_FLASH_TRANSPARENT,
    ],
    transition: { duration: 0 },
  },
};

// ─────────────────────────────────────────────────────────────
//  Stagger for the list mount
// ─────────────────────────────────────────────────────────────

export const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};