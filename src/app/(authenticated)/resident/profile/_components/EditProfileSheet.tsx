"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, User as UserIcon, Hash } from "lucide-react";
import { editProfileAction, type EditProfileState } from "../actions";
import type { ResidentProfileData } from "@/lib/users/getResidentProfile";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";

const initialState: EditProfileState = { status: "idle" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ResidentProfileData["user"];
}

export default function EditProfileSheet({ open, onOpenChange, user }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(editProfileAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name);
  const [plotNumber, setPlotNumber] = useState(user.plotNumber ?? "");

  // Reset on open
  useEffect(() => {
    if (open) {
      setName(user.name);
      setPlotNumber(user.plotNumber ?? "");
    }
  }, [open, user]);

  // Handle action result
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Profile updated");
      onOpenChange(false);
      router.refresh();
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message ?? "Update failed");
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("plotNumber", plotNumber);
    startTransition(() => formAction(formData));
  };

  const isDirty = name !== user.name || plotNumber !== (user.plotNumber ?? "");

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title="Edit profile"
      description="Update your name and plot reference"
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
            disabled={!isDirty || isPending || !name.trim()}
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
          />
        </FormField>

        <FormField
          label="Plot number"
          helperText="As shown on your villa (optional reference)"
          errorText={state.errors?.plotNumber}
        >
          <Input
            type="text"
            value={plotNumber}
            onChange={(e) => setPlotNumber(e.target.value)}
            placeholder="e.g., A-12, Villa 39"
            leadingIcon={<Hash />}
            inputSize="md"
            maxLength={50}
          />
        </FormField>

        {/* Email — read-only display */}
        <FormField
          label="Email"
          helperText="Email cannot be changed. Contact admin if needed."
        >
          <Input
            type="email"
            value={user.email}
            readOnly
            inputSize="md"
            className="opacity-60 cursor-not-allowed"
          />
        </FormField>
      </div>
    </ResponsiveSheet>
  );
}
