import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");

  if (session.user.role !== "RESIDENT" && session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
