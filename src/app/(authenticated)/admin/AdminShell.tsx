"use client";

import { useUser } from "@/components/providers/UserProvider";
import Sidebar from "@/components/molecules/Sidebar";
import { AdminRoutes } from "@/lib/routes/admin.route";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar user={user} navItems={AdminRoutes} />

        <div className="flex-1 p-6 lg:p-8 transition-all duration-300 ease-in-out">
          {children}
        </div>
      </div>
    </main>
  );
}
