import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import ResidentShell from "./ResidentShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");

  if (session.user.role !== "RESIDENT") {
    redirect("/admin");
  }

  return <ResidentShell>{children}</ResidentShell>;
}
