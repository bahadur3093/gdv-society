"use client";

import Button from "@/components/atoms/Button";
import { cn } from "@/lib/utils/utils";
import { Save, X, Loader2, AlertCircle } from "lucide-react";

interface StickySaveBarProps {
  visible: boolean;
  saving?: boolean;
  message?: string;
  onDiscard?: () => void;
  onSave?: () => void;
  formId?: string;
}

export default function StickySaveBar({
  visible,
  saving = false,
  message = "You have unsaved changes",
  onDiscard,
  onSave,
  formId,
}: StickySaveBarProps) {
  return (
    <div
      role="region"
      aria-label="Save changes"
      aria-hidden={!visible}
      className={cn(
        "fixed left-0 right-0 bottom-0 z-30",
        "bg-bg-elevated/95 backdrop-blur-xl",
        "border-t border-border-default",
        "shadow-xl",
        "pb-[env(safe-area-inset-bottom)]",
        "transition-transform duration-(--duration-slow) ease-out",
        visible ? "translate-y-0" : "translate-y-full",
        !visible && "pointer-events-none",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-body-sm text-text-primary truncate">{message}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDiscard && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onDiscard}
              disabled={saving}
              icon={<X className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Discard</span>
            </Button>
          )}
          <Button
            type={formId ? "submit" : "button"}
            {...(formId ? { form: formId } : {})}
            variant="primary"
            size="md"
            onClick={!formId ? onSave : undefined}
            disabled={saving}
            icon={
              saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
