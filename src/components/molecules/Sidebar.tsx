"use client";

import { NavItem } from "@/types/navbar";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { AppUser } from "../providers/UserProvider";

interface SidebarInterface {
  user: AppUser;
  navItems: NavItem[];
}

export default function Sidebar({ user, navItems }: SidebarInterface) {
  const isAdmin = user.role === "ADMIN";
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/signin" });
  };

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-slate-900/50 border-b border-slate-800/40">
        <h1 className="text-lg font-bold text-slate-100">Resident Portal</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } lg:block lg:w-86 bg-zinc-950 border-r border-slate-800/40 lg:min-h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="px-4 py-6 sticky top-0 h-screen flex flex-col">
          <div className="hidden lg:flex mb-8 gap-3 flex-row items-center">
            <div className="w-16 h-16 bg-violet-500/80 rounded-full shrink-0 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="grow">
              <h1 className="text-xl font-bold text-violet-500 mb-1">
                {isAdmin ? "Admin Panel" : user.name}
              </h1>
              {!isAdmin && (
                <h4 className="text-sm text-white font-medium">
                  #{user.plotNumber} - {user.plotData?.areaInSqFt} sq ft
                </h4>
              )}
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
                    isActive
                      ? "bg-green-600 text-slate-900 shadow-lg"
                      : "text-white hover:text-slate-100 hover:bg-green-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 ease-in-out"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
