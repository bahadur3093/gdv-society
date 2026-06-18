"use client";

import {
  AlertCircle,
  Bell,
  Cog,
  Eye,
  ShieldAlert,
  Trash2,
  Pencil,
  CheckCircle,
  Zap,
  Info,
  Wrench,
  Calendar,
  CalendarIcon,
  RefreshCwIcon,
} from "lucide-react";
import AnnouncementForm from "../organisms/AnnouncementForm";
import { useState } from "react";
import useSWR from "swr";
import { Announcement } from "@/types/announcements";
import { PageLoader } from "../atoms";
import Modal from "../molecules/Modal";
import { api_del, api_get } from "@/lib/services/api";
import { isApiError } from "@/lib/services/api-error";

interface AnnouncementManagerProps {
  userRole: "admin" | "resident";
}

export default function AnnouncementManager({
  userRole,
}: AnnouncementManagerProps) {
  const [showAddAnnouncementForm, setShowAddAnnouncementForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Announcement | null>(
    null,
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pageLoader, setPageLoader] = useState<boolean>(false);

  const {
    data: announcements,
    error,
    isLoading,
    mutate: refetchAnnouncements,
  } = useSWR<Announcement[]>("api/announcement", api_get, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  const showAnnouncementDetails = (announcement: Announcement) => {
    setSelectedRequest(announcement);
    setShowRequestModal(true);
  };

  const deleteAnnouncementDetails = async (id: string) => {
    setPageLoader(true);
    try {
      const response = await api_del(`api/announcement/${id}`);
      if (response) {
        refetchAnnouncements();
      }
      setPageLoader(false);
    } catch (err) {
      if (isApiError(err)) {
        console.log(err.status === 409 ? "Duplicate entry" : err.message);
      } else {
        console.log("Something went wrong");
      }

      setPageLoader(false);
    }
  };

  const onSuccessAddAnnouncement = () => {
    setShowAddAnnouncementForm(false);
    refetchAnnouncements();
  };

  const editAddAnnouncementHandler = (announcement: Announcement) => {
    setSelectedRequest(announcement);
    setEditAnnouncement(true);
    setShowAddAnnouncementForm(true);
  };

  if (pageLoader) {
    return <PageLoader message="Processing" fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 select-none font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Cog className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Announcements Manager
            </h2>
            <p className="text-sm text-slate-400">
              Manage and view announcements for residents.
            </p>
          </div>
        </div>
        {userRole === "admin" && (
          <button
            onClick={() => setShowAddAnnouncementForm(!showAddAnnouncementForm)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            Add Announcement
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Add new announcement form */}
      {showAddAnnouncementForm && (
        <Modal
          isOpen={showAddAnnouncementForm}
          onClose={() => {
            setShowAddAnnouncementForm(false);
            setSelectedRequest(null);
          }}
          title="Add New Announcement"
          size="lg"
        >
          {/* Request Details */}
          <AnnouncementForm
            onSuccess={onSuccessAddAnnouncement}
            isEditing={editAnnouncement}
            announcement={selectedRequest}
          />
        </Modal>
      )}

      {/* Announcements list */}
      {isLoading ? (
        <PageLoader message="Loading announcements..." fullScreen={false} />
      ) : (
        !announcements?.length && (
          <div className="my-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
            <ShieldAlert className="w-5 h-5" />
            <span>No announcements found.</span>
          </div>
        )
      )}

      {announcements?.length && (
        <div className="mt-6 border-t border-slate-800/40 rounded-lg bg-slate-900/50">
          {
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {announcements.map((announcement, index) => (
                  <tr
                    key={announcement.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {index + 1}
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate"
                      title={announcement.title}
                    >
                      <span className="text-slate-200 text-sm font-semibold">
                        {announcement.title || "Untitled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          announcement.category === "General"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : announcement.category === "Maintenance"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              : announcement.category === "Event"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-slate-700 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {announcement.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          announcement.priority === "critical"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                            : announcement.priority === "high"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              : announcement.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {announcement.priority || "low"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          announcement.isActive
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-slate-700 text-slate-400 border border-slate-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${announcement.isActive ? "bg-green-400" : "bg-slate-500"}`}
                        />
                        {announcement.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right flex gap-2">
                      <button
                        onClick={() => editAddAnnouncementHandler(announcement)}
                        className="p-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => showAnnouncementDetails(announcement)}
                        className="p-2 bg-blue-600 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() =>
                          deleteAnnouncementDetails(announcement.id)
                        }
                        className="p-2 bg-red-700 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}

      {/* Announcements details modal */}
      {selectedRequest && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title={selectedRequest.title}
          size={selectedRequest.content.length > 200 ? "lg" : "md"}
        >
          <div className="py-8 space-y-6">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  selectedRequest.category === "General"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : selectedRequest.category === "Maintenance"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : selectedRequest.category === "Event"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-slate-700 text-slate-300 border-slate-600"
                }`}
              >
                {selectedRequest.category === "General" && (
                  <Info className="w-3 h-3 mr-1.5" />
                )}
                {selectedRequest.category === "Maintenance" && (
                  <Wrench className="w-3 h-3 mr-1.5" />
                )}
                {selectedRequest.category === "Event" && (
                  <Calendar className="w-3 h-3 mr-1.5" />
                )}
                {!["General", "Maintenance", "Event"].includes(
                  selectedRequest.category,
                ) && <Info className="w-3 h-3 mr-1.5" />}
                {selectedRequest.category || "General"}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  selectedRequest.isActive
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {selectedRequest.isActive ? (
                  <span className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${selectedRequest.isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : ""}`}
                    />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${selectedRequest.isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : ""}`}
                    />
                    Inactive
                  </span>
                )}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${
                  selectedRequest.priority === "critical"
                    ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse"
                    : selectedRequest.priority === "high"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                      : selectedRequest.priority === "medium"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                        : "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                }`}
              >
                {selectedRequest.priority === "critical" && (
                  <AlertCircle className="w-3 h-3 mr-1.5 animate-pulse" />
                )}
                {selectedRequest.priority === "high" && (
                  <Zap className="w-3 h-3 mr-1.5 text-orange-400" />
                )}
                {selectedRequest.priority === "medium" && (
                  <Bell className="w-3 h-3 mr-1.5 text-yellow-400" />
                )}
                {selectedRequest.priority === "low" && (
                  <CheckCircle className="w-3 h-3 mr-1.5 text-green-400" />
                )}
                {selectedRequest.priority}
              </span>
            </div>
            {/* Content */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-slate-100">
                Descriptions
              </h4>

              <div className="border border-slate-800 rounded-lg p-3 bg-slate-800/50">
                <p className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
                  {selectedRequest?.content}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-x-6 items-center">
              <div className="flex flex-row text-slate-300 border border-slate-900 rounded-lg p-2 bg-slate-800/50 justify-between items-center">
                <CalendarIcon className="w-16 h-16 mr-6 bg-black/15 px-2 rounded-md" />
                <div className="tracking-wide grow uppercase">
                  <span className="text-sm font-bold"> Date Created</span>
                  <p className="text-xs font-normal text-slate-200 uppercase tracking-wide grow">
                    {new Date(selectedRequest.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-row text-slate-300 border border-slate-900 rounded-lg p-2 bg-slate-800/50 justify-between items-center">
                <RefreshCwIcon className="w-16 h-16 mr-6 bg-black/15 px-2 rounded-md" />
                <div className="tracking-wide grow uppercase">
                  <span className="text-sm font-bold"> Last Updated</span>
                  <p className="text-sm font-medium text-slate-200 uppercase tracking-wide grow">
                    {new Date(selectedRequest.updatedAt).toDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
