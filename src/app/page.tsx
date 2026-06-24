import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");

  if (session.user.accountStatus === "PENDING") {
    redirect("/auth/verification-pending");
  }
  if (session.user.accountStatus === "SUSPENDED") {
    redirect("/auth/signin?error=suspended");
  }

  if (session.user.role === "ADMIN") redirect("/admin");
  redirect("/resident");
}
