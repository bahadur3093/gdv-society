"use client";

import { Announcement } from "@/types/announcements";
import { Bell, RotateCcwIcon } from "lucide-react";

interface AnnouncementsWrapperInterface {
  announcements: Announcement[];
  refresh: () => void;
}

export default function AnnouncementsWrapper({
  announcements,
  refresh,
}: AnnouncementsWrapperInterface) {
  if (!announcements || announcements?.length === 0) {
    return (
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-bold text-slate-100">
            Community Announcements
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-slate-400">No announcements found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <Bell className="w-5 h-5 text-violet-400" />
        </div>
        <div className="grow">
          <h2 className="text-xl font-bold text-slate-100 w-100 flex items-center">
            <span className="mr-2">Community Announcements</span>
            <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 shadow-lg ring-2 ring-slate-700/30">
              <span className="text-sm font-bold text-white">
                {announcements.length}
              </span>
            </span>
          </h2>
        </div>
        <div
          className="w-8 h-8 p-2 flex border border-slate-800 rounded-full justify-center items-center bg-linear-to-br from-violet-600 to-indigo-600 cursor-pointer"
          onClick={refresh}
        >
          <RotateCcwIcon className="text-violet-100" />
        </div>
      </div>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border-l-2 border-violet-500/50 pl-4 py-2"
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-200">
                {announcement.title}
              </h3>
              <span
                className={`text-xs px-2 py-1 capitalize rounded ${
                  announcement.priority === "high"
                    ? "bg-red-500/20 text-red-400"
                    : announcement.priority === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                }`}
              >
                {announcement.priority}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              {announcement.content}
            </p>
            <p className="text-xs text-slate-500">
              Posted on{" "}
              {new Date(announcement.publishDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
