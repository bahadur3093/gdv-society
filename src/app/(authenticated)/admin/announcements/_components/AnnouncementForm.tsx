"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ChevronLeft,
  AlertCircle,
  Calendar,
  Sparkles,
  Wrench,
  Megaphone,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type AnnouncementActionState,
} from "../actions";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import RichEditor from "@/components/molecules/RichEditor";
import FormField from "@/components/atoms/FormField";
import { toast } from "@/components/atoms/Toast";
import { cn } from "@/lib/utils/utils";
import Input from "@/components/atoms/Input";

const initialState: AnnouncementActionState = { status: "idle" };

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "Maintenance", label: "Maintenance", icon: <Wrench className="w-full h-full" /> },
  { value: "Events", label: "Events", icon: <Sparkles className="w-full h-full" /> },
  { value: "Emergency", label: "Emergency", icon: <AlertTriangle className="w-full h-full" /> },
  { value: "General", label: "General", icon: <Megaphone className="w-full h-full" /> },
  { value: "Financial", label: "Financial", icon: <DollarSign className="w-full h-full" /> },
];

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    color: "text-text-secondary",
    activeBg: "bg-bg-sunken",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-info",
    activeBg: "bg-info-muted",
  },
  {
    value: "high",
    label: "High",
    color: "text-warning",
    activeBg: "bg-warning-muted",
  },
  {
    value: "critical",
    label: "Critical",
    color: "text-danger",
    activeBg: "bg-danger-muted",
  },
];

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface InitialValues {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  priority?: string;
  publishDate?: Date;
  isActive?: boolean;
}

interface Props {
  /** Provided when editing (id = announcement to update) */
  initialValues?: InitialValues;
  /** Page title */
  mode: "create" | "edit";
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function AnnouncementForm({ initialValues = {}, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Pick the right action based on mode
  const [state, formAction] = useActionState(
    isEdit ? updateAnnouncementAction : createAnnouncementAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  // Controlled form state
  const [title, setTitle] = useState(initialValues.title ?? "");
  const [content, setContent] = useState(initialValues.content ?? "");
  const [category, setCategory] = useState(initialValues.category ?? "General");
  const [priority, setPriority] = useState(initialValues.priority ?? "medium");
  const [publishDate, setPublishDate] = useState(
    formatDateForInput(initialValues.publishDate ?? new Date()),
  );
  const [isActive, setIsActive] = useState(initialValues.isActive ?? true);

  // Toast + redirect on success
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      router.push("/admin/announcements");
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message ?? "Failed to save");
    }
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Form submission
  const handleSubmit = () => {
    const formData = new FormData();
    if (isEdit && initialValues.id) {
      formData.set("id", initialValues.id);
    }
    formData.set("title", title);
    formData.set("content", content);
    formData.set("category", category);
    formData.set("priority", priority);
    formData.set("publishDate", publishDate);
    formData.set("isActive", String(isActive));

    startTransition(() => formAction(formData));
  };

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    content !== "<p></p>" &&
    !isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ─── Top bar: back + publish ─── */}
      <div className="flex items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          size="md"
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          <Link href={"/admin/announcements"}>Back to list</Link>
        </Button>

        <Button
          variant="primary"
          size="md"
          shape="pill"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? "Publishing…" : isEdit ? "Update" : "Publish"}
        </Button>
      </div>

      {/* ─── Page header ─── */}
      <div>
        <h1 className="text-h1 text-text-primary">
          {isEdit ? "Edit announcement" : "Create announcement"}
        </h1>
        <p className="text-body-lg text-text-secondary mt-2">
          {isEdit
            ? "Update the announcement details below."
            : "Compose a message that residents will see on their dashboard."}
        </p>
      </div>

      {/* ─── Error banner ─── */}
      {state.status === "error" && state.errors && (
        <Card padding="md" className="border-danger-border bg-danger-muted">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-body font-medium text-danger">
                Please fix the errors below
              </p>
              <ul className="mt-2 text-body-sm text-danger/90 space-y-1">
                {Object.entries(state.errors).map(([field, msg]) => (
                  <li key={field}>
                    <strong className="capitalize">{field}:</strong> {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Rich text editor ─── */}
      <RichEditor
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
        titlePlaceholder="Announcement title"
        contentPlaceholder="Write your announcement…"
        characterLimit={2000}
      />

      {/* ─── Settings grid ─── */}
      <Card padding="md">
        <div className="space-y-6">
          {/* Category */}
          <FormField label="Category" required>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const isActive = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "inline-flex items-center gap-2",
                      "px-3.5 h-10 rounded-full border",
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
                    <span className="w-4 h-4 inline-flex">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Priority */}
          <FormField
            label="Priority"
            required
            helperText="High and critical priorities show with badges on residents' home page"
          >
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const isActive = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "inline-flex items-center gap-2",
                      "px-4 h-10 rounded-full border",
                      "text-body-sm font-medium",
                      "transition-all duration-[var(--duration-fast)]",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-brand-primary/30",
                      isActive
                        ? cn(p.activeBg, p.color, "border-current")
                        : "bg-transparent text-text-secondary border-border-default hover:bg-bg-sunken hover:text-text-primary",
                    )}
                    aria-pressed={isActive}
                  >
                    <span className="capitalize">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Publish date + Active toggle in 2-col grid on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Publish date"
              required
              helperText="When this becomes visible to residents"
            >
              <Input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                inputSize="md"
                trailingIcon={<Calendar />}
              />
            </FormField>

            <FormField
              label="Visibility"
              helperText={
                isActive
                  ? "Residents will see this announcement"
                  : "Saved as draft — residents will not see it"
              }
            >
              <div className="flex items-center gap-3 h-10">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0",
                    "rounded-full transition-colors duration-(--duration-fast)",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-brand-primary/30",
                    isActive
                      ? "bg-brand-primary"
                      : "bg-bg-sunken border border-border-default",
                  )}
                  role="switch"
                  aria-checked={isActive}
                  aria-label="Active"
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 rounded-full bg-white",
                      "transition-transform duration-(--duration-fast)",
                      "shadow-md",
                      isActive ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
                <span className="text-body text-text-primary">
                  {isActive ? "Active" : "Draft"}
                </span>
              </div>
            </FormField>
          </div>
        </div>
      </Card>

      {/* ─── Bottom actions ─── */}
      <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end pb-6">
        <Button asChild type="button" variant="ghost" size="lg">
          <Link href={"/admin/announcements"}>Cancel</Link>
        </Button>
        <Button
          variant="primary"
          size="lg"
          shape="pill"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending
            ? "Publishing…"
            : isEdit
              ? "Update announcement"
              : "Publish announcement"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatDateForInput(date: Date): string {
  // Format as YYYY-MM-DD for native date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
