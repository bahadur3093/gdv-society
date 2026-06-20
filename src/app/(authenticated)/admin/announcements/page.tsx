import AnnouncementManager from "@/components/templates/AnnouncementManager";

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <AnnouncementManager userRole="admin" />
    </div>
  );
}
