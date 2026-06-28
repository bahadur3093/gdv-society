// filepath: src/app/(authenticated)/admin/chat/_components/DeleteConversationModal.tsx
"use client";

import { Trash2 } from "lucide-react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";

interface Props {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConversationModal({
  open,
  isPending,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onClose();
      }}
      title="Delete conversation?"
      description="This will permanently remove the conversation and its messages. This action cannot be undone."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onConfirm}
            loading={isPending}
            loadingText="Deleting…"
          >
            Delete forever
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-text-muted">
        Are you sure you want to delete this conversation?
      </p>
    </Modal>
  );
}