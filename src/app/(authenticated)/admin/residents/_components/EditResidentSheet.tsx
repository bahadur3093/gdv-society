"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  AlertCircle,
  Mail,
  User as UserIcon,
  Hash,
  Home,
} from "lucide-react";
import { editResidentAction, type EditResidentState } from "../actions";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import { cn } from "@/lib/utils/utils";

const initialState: EditResidentState = { status: "idle" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: AdminResidentDetail;
  availableVillas: Array<{
    id: string;
    villaNo: number;
    ownerName: string;
  }>;
}

export default function EditResidentSheet({
  open,
  onOpenChange,
  resident,
  availableVillas,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(editResidentAction, initialState);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState(resident.name);
  const [email, setEmail] = useState(resident.email);
  const [plotNumber, setPlotNumber] = useState(resident.plotNumber ?? "");
  const [villaId, setVillaId] = useState(resident.villa?.id ?? "");

  // Reset form when sheet opens (in case resident data changed)
  useEffect(() => {
    if (open) {
      setName(resident.name);
      setEmail(resident.email);
      setPlotNumber(resident.plotNumber ?? "");
      setVillaId(resident.villa?.id ?? "");
    }
  }, [open, resident]);

  // Handle action result
  useEffect(() => {
    if (state.status === "success") {
      toast.success("Resident updated", {
        description: state.message,
      });
      onOpenChange(false);
      router.refresh();
    } else if (state.status === "error" && !state.errors) {
      // Non-field-level errors get toast (field errors show inline)
      toast.error(state.message ?? "Update failed");
    }
  }, [state.status, state.message]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submit
  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("userId", resident.id);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("plotNumber", plotNumber);
    formData.set("villaId", villaId);
    startTransition(() => formAction(formData));
  };

  // Detect if anything changed
  const isDirty =
    name !== resident.name ||
    email !== resident.email ||
    plotNumber !== (resident.plotNumber ?? "") ||
    villaId !== (resident.villa?.id ?? "");

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title="Edit resident"
      description={`Update details for ${resident.name}`}
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
            disabled={!isDirty || isPending}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Form-level error (non-field) */}
        {state.status === "error" && !state.errors && state.message && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">{state.message}</p>
          </div>
        )}

        {/* Name */}
        <FormField label="Name" required errorText={state.errors?.name}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            leadingIcon={<UserIcon />}
            inputSize="md"
            maxLength={100}
          />
        </FormField>

        {/* Email */}
        <FormField
          label="Email"
          required
          errorText={state.errors?.email}
          helperText={
            !resident.emailVerified
              ? "Email not yet verified by resident"
              : "Resident uses this to log in"
          }
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="resident@example.com"
            leadingIcon={<Mail />}
            inputSize="md"
          />
        </FormField>

        {/* Plot number (display label, not for DB) */}
        <FormField
          label="Plot number (display)"
          helperText="Shown to resident as their plot reference"
          errorText={state.errors?.plotNumber}
        >
          <Input
            type="text"
            value={plotNumber}
            onChange={(e) => setPlotNumber(e.target.value)}
            placeholder="e.g., A-12, Villa 39"
            leadingIcon={<Hash />}
            inputSize="md"
          />
        </FormField>

        {/* Villa link */}
        <FormField
          label="Linked villa"
          helperText="The villa this resident's bills are tied to. Set to none to unlink."
          errorText={state.errors?.villaId}
        >
          <VillaSelect
            value={villaId}
            onChange={setVillaId}
            options={availableVillas}
            currentVillaNo={resident.villa?.villaNo}
          />
        </FormField>
      </div>
    </ResponsiveSheet>
  );
}

// ─────────────────────────────────────────────────────────────
//  Villa Select — themed dropdown
// ─────────────────────────────────────────────────────────────

interface VillaSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: Array<{ id: string; villaNo: number; ownerName: string }>;
  currentVillaNo?: number;
}

function VillaSelect({
  value,
  onChange,
  options,
  currentVillaNo,
}: VillaSelectProps) {
  return (
    <div className="relative">
      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-10 pl-10 pr-9",
          "bg-bg-elevated border border-border-default rounded",
          "text-body text-text-primary",
          "appearance-none cursor-pointer",
          "transition-colors duration-[var(--duration-fast)]",
          "hover:border-border-strong",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
        )}
      >
        <option value="">— No villa linked —</option>
        {options.map((v) => {
          const isCurrent = v.villaNo === currentVillaNo;
          return (
            <option key={v.id} value={v.id}>
              Villa {v.villaNo} — {v.ownerName}
              {isCurrent ? " (current)" : ""}
            </option>
          );
        })}
      </select>
      {/* Chevron */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
