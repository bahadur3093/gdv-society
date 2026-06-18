
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");

  if (session.user.role !== "ADMIN" && !session.user.emailVerified) {
    redirect("/auth/verification-pending");
  }

  if (session.user.role === "ADMIN") redirect("/admin");
  redirect("/resident");
}
