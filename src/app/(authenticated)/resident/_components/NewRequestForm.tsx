"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import {
  REQUEST_TYPE_LABELS,
  REQUEST_TYPE_FIELDS,
} from "@/lib/helpdesk/constants";
import { createResidentRequest } from "@/lib/helpdesk/actions";
import type { RequestType } from "@prisma/client";
import { Loader2 } from "lucide-react";

const TYPES = Object.keys(REQUEST_TYPE_LABELS) as RequestType[];

export default function NewRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<RequestType>("PAYMENT_ISSUE");
  const [description, setDescription] = useState("");
  const [newPlotSize, setNewPlotSize] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyContact, setFamilyContact] = useState("");

  const fields = REQUEST_TYPE_FIELDS[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await createResidentRequest({
        requestType: type,
        description,
        newPlotSize: newPlotSize ? Number(newPlotSize) : undefined,
        familyMemberName: familyName || undefined,
        familyMemberRelation: familyRelation || undefined,
        familyMemberContact: familyContact || undefined,
      });

      if (res.ok) {
        toast.success("Request submitted");
        router.push(`/resident/requests/${res.id}`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Request type */}
      <div>
        <label className="text-body-sm font-medium text-text-primary block mb-1.5">
          Request Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RequestType)}
          className={cn(
            "w-full h-11 px-3 rounded-lg",
            "bg-bg-sunken border border-border-default",
            "text-body text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          )}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {REQUEST_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Plot size */}
      {fields.needsPlotSize && (
        <div>
          <label className="text-body-sm font-medium text-text-primary block mb-1.5">
            New Plot Size (sqft)
          </label>
          <input
            type="number"
            value={newPlotSize}
            onChange={(e) => setNewPlotSize(e.target.value)}
            placeholder="e.g. 2400"
            required
            className={cn(
              "w-full h-11 px-3 rounded-lg",
              "bg-bg-sunken border border-border-default",
              "text-body text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
            )}
          />
        </div>
      )}

      {/* Family member fields */}
      {fields.needsFamilyMember && (
        <div className="space-y-3">
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
              className={cn(
                "w-full h-11 px-3 rounded-lg",
                "bg-bg-sunken border border-border-default",
                "text-body text-text-primary",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              )}
            />
          </div>
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">
              Relation
            </label>
            <input
              type="text"
              value={familyRelation}
              onChange={(e) => setFamilyRelation(e.target.value)}
              placeholder="e.g. Spouse, Son"
              required
              className={cn(
                "w-full h-11 px-3 rounded-lg",
                "bg-bg-sunken border border-border-default",
                "text-body text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              )}
            />
          </div>
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">
              Contact
            </label>
            <input
              type="tel"
              value={familyContact}
              onChange={(e) => setFamilyContact(e.target.value)}
              placeholder="10-digit mobile"
              className={cn(
                "w-full h-11 px-3 rounded-lg",
                "bg-bg-sunken border border-border-default",
                "text-body text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              )}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-body-sm font-medium text-text-primary block mb-1.5">
          {fields.descriptionLabel ?? "Description"}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={fields.descriptionPlaceholder}
          rows={5}
          required
          minLength={10}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg",
            "bg-bg-sunken border border-border-default",
            "text-body text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
            "resize-none",
          )}
        />
        <p className="text-micro text-text-muted mt-1">Minimum 10 characters</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className={cn(
            "px-4 h-11 rounded-lg",
            "text-body-sm text-text-secondary",
            "border border-border-subtle",
            "hover:bg-bg-elevated",
            "disabled:opacity-50",
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex-1 h-11 rounded-lg",
            "bg-(image:--gradient-brand) text-white",
            "text-body-sm font-semibold",
            "shadow-lg shadow-brand-primary/20",
            "inline-flex items-center justify-center gap-2",
            "active:scale-[0.98] transition-transform",
            "disabled:opacity-70",
          )}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Request
        </button>
      </div>
    </form>
  );
}
