import { UserCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/navigation/PageHeader";
import Button from "@/components/atoms/Button";
import AdminInfoCard from "./_components/AdminInfoCard";
import AdminSecuritySection from "./_components/AdminSecuritySection";
import AdminAccountSection from "./_components/AdminAccountSection";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profile — Admin" };

export default async function AdminProfilePage() {
  const adminUser = await requireAdmin();

  // Fetch full admin data
  const admin = await prisma.user.findUnique({
    where: { id: adminUser.id, role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!admin) {
    notFound();
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" icon={<ArrowLeft />}>
        <Link href={"/admin/ledger"}>Back to admin</Link>
      </Button>

      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
        }
        title="Admin Profile"
        description="Manage your administrator account and security"
      />

      <AdminInfoCard admin={admin} />

      <AdminSecuritySection admin={admin} />

      <AdminAccountSection email={admin.email} />
    </div>
  );
}
