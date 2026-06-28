// filepath: src/app/(authenticated)/admin/chat/_components/EditTitleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import { cn } from "@/lib/utils/utils";

interface Props {
  open: boolean;
  isPending: boolean;
  initialTitle: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

const MAX_LENGTH = 100;

export default function EditTitleModal({
  open,
  isPending,
  initialTitle,
  onClose,
  onConfirm,
}: Props) {
  const [title, setTitle] = useState(initialTitle);

  // Reset the local draft when the modal opens with a new title
  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  const trimmed = title.trim();
  const canSave = trimmed.length > 0 && !isPending;

  const handleConfirm = () => {
    if (canSave) onConfirm(title);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onClose();
      }}
      title="Edit conversation title"
      description="Give this conversation a name so you can find it later."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Edit3 className="w-4 h-4" />}
            onClick={handleConfirm}
            loading={isPending}
            loadingText="Saving…"
            disabled={!canSave}
          >
            Save title
          </Button>
        </>
      }
    >
      <label
        htmlFor="conversation-title-input"
        className="block text-body-sm font-medium text-text-primary mb-1.5"
      >
        Title
      </label>
      <input
        id="conversation-title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
        }}
        placeholder="e.g. June maintenance query"
        maxLength={MAX_LENGTH}
        autoFocus
        disabled={isPending}
        className={cn(
          "w-full h-10 px-3",
          "bg-bg-sunken border border-border-subtle rounded-xl",
          "text-body-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          "focus:border-brand-primary",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      />
      <p className="text-micro text-text-muted mt-1.5">
        {title.length}/{MAX_LENGTH}
      </p>
    </Modal>
  );
}