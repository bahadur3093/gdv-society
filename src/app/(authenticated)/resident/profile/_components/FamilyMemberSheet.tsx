"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, User as UserIcon, Phone } from "lucide-react";
import {
  addFamilyMemberAction,
  editFamilyMemberAction,
  type FamilyMemberState,
} from "../actions";
import type { ResidentProfileData } from "@/lib/users/getResidentProfile";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import { cn } from "@/lib/utils/utils";

const initialState: FamilyMemberState = { status: "idle" };

const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "In-Law",
  "Other",
];

type FamilyMember = ResidentProfileData["familyMembers"][number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  member?: FamilyMember;
}

export default function FamilyMemberSheet({
  open,
  onOpenChange,
  mode,
  member,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [state, formAction] = useActionState(
    isEdit ? editFamilyMemberAction : addFamilyMemberAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [contact, setContact] = useState("");

  // Reset on open
  useEffect(() => {
    if (!open) return;

    if (isEdit && member) {
      setName(member.name);
      setRelationship(member.relationship);
      setContact(member.contact);
    } else {
      setName("");
      setRelationship("Spouse");
      setContact("");
    }
  }, [open, isEdit, member]);

  // Action result
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      onOpenChange(false);
      router.refresh();
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message ?? "Failed to save");
    }
  }, [state]);

  const isDirty =
    isEdit && member
      ? name !== member.name ||
        relationship !== member.relationship ||
        contact !== member.contact
      : name.trim().length > 0 || contact.trim().length > 0;

  const isValid =
    name.trim().length >= 2 && relationship && contact.trim().length >= 1;

  const handleSubmit = () => {
    const formData = new FormData();
    if (isEdit && member) {
      formData.set("memberId", member.id);
    }
    formData.set("name", name);
    formData.set("relationship", relationship);
    formData.set("contact", contact);
    startTransition(() => formAction(formData));
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title={isEdit ? "Edit family member" : "Add family member"}
      description={
        isEdit
          ? "Update their details below"
          : "Add a family member to your society records"
      }
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
            disabled={!isValid || !isDirty || isPending}
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add member"}
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
            placeholder="Full name"
            leadingIcon={<UserIcon />}
            inputSize="md"
            maxLength={100}
            autoFocus={!isEdit}
          />
        </FormField>

        <FormField
          label="Relationship"
          required
          errorText={state.errors?.relationship}
        >
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => {
              const isActive = relationship === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRelationship(r)}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "px-4 h-10 rounded-full border",
                    "text-body-sm font-medium",
                    "transition-all duration-(--duration-fast)",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-brand-primary/30",
                    isActive
                      ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                      : "bg-transparent text-text-secondary border-border-default hover:bg-bg-sunken hover:text-text-primary",
                  )}
                  aria-pressed={isActive}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Contact"
          required
          errorText={state.errors?.contact}
          helperText="Phone number or alternate contact"
        >
          <Input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+91 98765 43210"
            leadingIcon={<Phone />}
            inputSize="md"
            maxLength={50}
          />
        </FormField>
      </div>
    </ResponsiveSheet>
  );
}
