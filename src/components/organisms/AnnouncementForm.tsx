"use client";

import { useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { api_patch, api_post, api_put } from "@/lib/services/api";
import { Announcement } from "@/types/announcements";
import { PageLoader } from "../atoms";
import { isApiError } from "@/lib/services/api-error";
import { getChangedFields } from "@/lib/utils/form";

interface AnnouncementFormData {
  title: string;
  content: string;
  category: "General" | "Maintenance" | "Event" | "Emergency";
  priority: "low" | "medium" | "high" | "critical";
}

const initialFormData: AnnouncementFormData = {
  title: "",
  content: "",
  category: "General",
  priority: "medium",
};

export default function AnnouncementForm({
  onSuccess,
  isEditing = false,
  announcement,
}: {
  onSuccess: () => void;
  isEditing: boolean;
  announcement?: Announcement | null;
}) {
  const editFormData: AnnouncementFormData | undefined =
    isEditing && announcement
      ? {
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          priority: announcement.priority,
        }
      : initialFormData;
  const [formData, setFormData] =
    useState<Partial<AnnouncementFormData>>(editFormData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing && announcement) {
        debugger
        const changes = getChangedFields(announcement, formData);

        if(Object.keys(changes).length === 0) {
          onSuccess();

          return;
        }

        await api_patch<Announcement>(
          `api/announcement/${announcement.id}`,
          changes,
        );
      } else {
        await api_post<Announcement>("api/announcement", formData);
      }

      resetForm();
      onSuccess();
    } catch (err) {
      if (isApiError(err)) {
        setError(err.status === 409 ? "Duplicate entry" : err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="relative py-6">
      {isSubmitting && <PageLoader message="Processing" fullScreen />}
      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {/* Announcement Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Announcement Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            placeholder="Enter a catchy announcement title..."
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Announcement Content *
          </label>
          <textarea
            id="content"
            value={formData.content || ""}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
            rows={6}
            placeholder="Write the full announcement details here..."
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
          />
        </div>

        {/* Category and Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Selection */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              value={formData.category || "General"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as AnnouncementFormData["category"],
                })
              }
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
            >
              <option value="General">📢 General</option>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="Event">🎉 Event</option>
              <option value="Emergency">⚠️ Emergency</option>
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Priority *
            </label>
            <select
              id="priority"
              value={formData.priority || "medium"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as AnnouncementFormData["priority"],
                })
              }
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🔵 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-800/50">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.content}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isSubmitting
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
            }${
              isSubmitting || !formData.title || !formData.content
                ? " cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Update" : "Create"} Announcement
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting || !formData.title || !formData.content}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isSubmitting
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 text-white"
            }`}
          >
            Reset Form
          </button>
        </div>

        {/* Priority Info */}
        {formData.priority && (
          <div
            className={`p-3 rounded-lg text-sm ${
              formData.priority === "critical"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : formData.priority === "high"
                  ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                  : formData.priority === "medium"
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                    : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}
          >
            <span className="font-medium">Priority: </span>
            {formData.priority === "critical" && (
              <>🔴 Critical - Immediate attention required</>
            )}
            {formData.priority === "high" && (
              <>🟠 High - Should be addressed soon</>
            )}
            {formData.priority === "medium" && (
              <>🔵 Medium - Normal priority announcement</>
            )}
            {formData.priority === "low" && <>🟢 Low - General information</>}
          </div>
        )}

        {/* Category Info */}
        {formData.category && (
          <div
            className={`p-3 rounded-lg text-sm ${
              formData.category === "Emergency"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : formData.category === "Event"
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  : formData.category === "Maintenance"
                    ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                    : "bg-slate-700/30 border border-slate-600/30 text-slate-300"
            }`}
          >
            <span className="font-medium">Category: </span>
            {formData.category === "Emergency" && (
              <>⚠️ Emergency - Important safety or urgent matters</>
            )}
            {formData.category === "Event" && (
              <>🎉 Event - Community gatherings and activities</>
            )}
            {formData.category === "Maintenance" && (
              <>🔧 Maintenance - Building repairs and improvements</>
            )}
            {formData.category === "General" && (
              <>📢 General - Regular community updates</>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
