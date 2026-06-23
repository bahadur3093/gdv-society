"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  AlertCircle,
  Hash,
  User as UserIcon,
  Ruler,
  Home,
  FileText,
} from "lucide-react";
import {
  createVillaAction,
  editVillaAction,
  type VillaActionState,
} from "../actions";
import type { AdminVillaRow } from "@/lib/villas/getAdminVillas";
import { toast } from "@/components/atoms/Toast";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import { cn } from "@/lib/utils/utils";

const initialState: VillaActionState = { status: "idle" };

const VILLA_TYPES = ["Standard", "Corner", "Premium", "Custom"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  villa?: AdminVillaRow;
}

export default function EditVillaSheet({
  open,
  onOpenChange,
  mode,
  villa,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [state, formAction] = useActionState(
    isEdit ? editVillaAction : createVillaAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  // ─── Form state ───
  const [villaNo, setVillaNo] = useState("");
  const [type, setType] = useState("Standard");
  const [ownerName, setOwnerName] = useState("");
  const [areaInSqFt, setAreaInSqFt] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isBillable, setIsBillable] = useState(true);

  // Reset form when sheet opens (covers both create + edit)
  useEffect(() => {
    if (!open) return;

    if (isEdit && villa) {
      setVillaNo(String(villa.villaNo));
      setType(villa.type);
      setOwnerName(villa.ownerName);
      setAreaInSqFt(String(villa.areaInSqFt));
      setRemarks(villa.remarks ?? "");
      setIsBillable(villa.isBillable);
    } else {
      // Create mode — reset to defaults
      setVillaNo("");
      setType("Standard");
      setOwnerName("");
      setAreaInSqFt("");
      setRemarks("");
      setIsBillable(true);
    }
  }, [open, isEdit, villa]);

  // Handle action result
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      onOpenChange(false);
      router.refresh();
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message ?? "Failed to save");
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dirty detection (edit mode only) ───
  const isDirty =
    isEdit && villa
      ? type !== villa.type ||
        ownerName !== villa.ownerName ||
        areaInSqFt !== String(villa.areaInSqFt) ||
        remarks !== (villa.remarks ?? "") ||
        isBillable !== villa.isBillable
      : true; // Create mode is always "dirty"

  // ─── Validity check ───
  const isValid =
    (!isEdit ? villaNo.trim().length > 0 : true) &&
    type.length > 0 &&
    ownerName.trim().length > 0 &&
    areaInSqFt.trim().length > 0 &&
    !isNaN(parseFloat(areaInSqFt)) &&
    parseFloat(areaInSqFt) > 0;

  // ─── Auto-computed sqm preview ───
  const areaInSqMPreview =
    !isNaN(parseFloat(areaInSqFt)) && parseFloat(areaInSqFt) > 0
      ? (parseFloat(areaInSqFt) * 0.092903).toFixed(2)
      : null;

  // ─── Submit ───
  const handleSubmit = () => {
    const formData = new FormData();
    if (isEdit && villa) {
      formData.set("id", villa.id);
    } else {
      formData.set("villaNo", villaNo);
    }
    formData.set("type", type);
    formData.set("ownerName", ownerName);
    formData.set("areaInSqFt", areaInSqFt);
    formData.set("remarks", remarks);
    formData.set("isBillable", String(isBillable));
    startTransition(() => formAction(formData));
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title={isEdit ? `Edit Villa ${villa?.villaNo}` : "Add new villa"}
      description={
        isEdit
          ? "Villa number cannot be changed. All other fields are editable."
          : "Create a new villa entry. Villa number must be unique."
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
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create villa"}
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

        {/* Villa number (create only) */}
        {!isEdit && (
          <FormField
            label="Villa number"
            required
            errorText={state.errors?.villaNo}
            helperText="Must be unique across the society"
          >
            <Input
              type="number"
              value={villaNo}
              onChange={(e) => setVillaNo(e.target.value)}
              placeholder="e.g., 48"
              leadingIcon={<Hash />}
              inputSize="md"
              min={1}
              max={9999}
            />
          </FormField>
        )}

        {/* Type */}
        <FormField label="Villa type" required errorText={state.errors?.type}>
          <div className="flex flex-wrap gap-2">
            {VILLA_TYPES.map((t) => {
              const isActive = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
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
                  <span>{t}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Owner name */}
        <FormField
          label="Owner name"
          required
          errorText={state.errors?.ownerName}
          helperText="The legal owner on record. May differ from current resident."
        >
          <Input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g., Bahadur Singh"
            leadingIcon={<UserIcon />}
            inputSize="md"
            maxLength={100}
          />
        </FormField>

        {/* Area */}
        <FormField
          label="Carpet area"
          required
          errorText={state.errors?.areaInSqFt}
          helperText={
            areaInSqMPreview
              ? `≈ ${areaInSqMPreview} sqm (auto-calculated)`
              : "In square feet. Square meters auto-calculated."
          }
        >
          <Input
            type="number"
            value={areaInSqFt}
            onChange={(e) => setAreaInSqFt(e.target.value)}
            placeholder="e.g., 1200"
            leadingIcon={<Ruler />}
            suffix="sqft"
            inputSize="md"
            min={1}
            step="0.01"
          />
        </FormField>

        {/* Remarks */}
        <FormField
          label="Remarks"
          errorText={state.errors?.remarks}
          helperText="Internal notes (e.g., facing direction, special features)"
        >
          <Input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., East-facing, has garden"
            leadingIcon={<FileText />}
            inputSize="md"
            maxLength={500}
          />
        </FormField>

        {/* Billable toggle */}
        <FormField
          label="Billing status"
          helperText={
            isBillable
              ? "Bills will be generated for this villa each month"
              : "No bills will be generated (under construction, internal, etc.)"
          }
        >
          <div className="flex items-center gap-3 h-10">
            <button
              type="button"
              onClick={() => setIsBillable(!isBillable)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0",
                "rounded-full transition-colors duration-(--duration-fast)",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-brand-primary/30",
                isBillable
                  ? "bg-success"
                  : "bg-bg-sunken border border-border-default",
              )}
              role="switch"
              aria-checked={isBillable}
              aria-label="Billable"
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white",
                  "transition-transform duration-(--duration-fast)",
                  "shadow-md",
                  isBillable ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
            <span
              className={cn(
                "text-body font-medium",
                isBillable ? "text-success" : "text-text-secondary",
              )}
            >
              {isBillable ? "Billable" : "Not billable"}
            </span>
          </div>
        </FormField>
      </div>
    </ResponsiveSheet>
  );
}
