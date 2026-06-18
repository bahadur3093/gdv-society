import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getLandingPath } from "@/lib/auth/redirect";
import VerificationPendingClient from "@/components/templates/VerificationPendingClient";

export default async function VerificationPendingPage() {
  const session = await auth();

  // Not logged in → signin
  if (!session?.user) redirect("/auth/signin");

  // Already verified (or is admin) → bounce to proper landing immediately
  if (session.user.emailVerified || session.user.role === "ADMIN") {
    redirect(getLandingPath(session));
  }

  return <VerificationPendingClient />;
}