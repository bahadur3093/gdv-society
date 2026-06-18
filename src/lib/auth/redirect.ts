import type { Session } from "next-auth";

export function getLandingPath(session: Session | null): string {
  if (!session?.user) return "/auth/signin";

  const { role, emailVerified } = session.user;

  if (role !== "ADMIN" && !emailVerified) {
    return "/auth/verification-pending";
  }

  if (role === "ADMIN") return "/admin";
  if (role === "RESIDENT") return "/resident";

  return "/auth/signin"; // fallback
}
