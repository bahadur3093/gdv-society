"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, User as UserIcon } from "lucide-react";
import { editAdminProfileAction, type EditAdminProfileState } from "../actions";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";

const initialState: EditAdminProfileState = { status: "idle" };

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin;
}

export default function EditAdminProfileSheet({
  open,
  onOpenChange,
  admin,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    editAdminProfileAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(admin.name);

  // Reset on open
  useEffect(() => {
    if (open) {
      setName(admin.name);
    }
  }, [open, admin.name]);

  // Action result — use full state for proper re-fire
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Profile updated");
      onOpenChange(false);
      router.refresh();
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message ?? "Update failed");
    }
  }, [state]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("name", name);
    startTransition(() => formAction(formData));
  };

  const isDirty = name !== admin.name;
  const isValid = name.trim().length >= 2;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title="Edit name"
      description="Update your display name"
      size="md"
      footer={
        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end w-full">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={<Save />}
            onClick={handleSubmit}
            disabled={!isDirty || !isValid || isPending}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Form-level error */}
        {state.status === "error" && !state.errors && state.message && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">{state.message}</p>
          </div>
        )}

        <FormField label="Name" required errorText={state.errors?.name}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            leadingIcon={<UserIcon />}
            inputSize="md"
            maxLength={100}
            autoFocus
          />
        </FormField>

        {/* Email — read-only */}
        <FormField
          label="Email"
          helperText="Email cannot be changed for security reasons"
        >
          <Input
            type="email"
            value={admin.email}
            readOnly
            inputSize="md"
            className="opacity-60 cursor-not-allowed"
          />
        </FormField>
      </div>
    </ResponsiveSheet>
  );
}
