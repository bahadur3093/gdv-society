// src/lib/auth/auth.ts

import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types";
import type { AccountStatus } from "@/lib/enums";
import { cache } from "react";
import { redirect } from "next/navigation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plotNumber: user.plotNumber,
          emailVerified: user.emailVerified,
          accountStatus: user.accountStatus,
        } as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plotNumber = (user as any).plotNumber;
        token.emailVerified = (user as any).emailVerified;
        token.accountStatus = (user as any).accountStatus;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.plotNumber = token.plotNumber as string | null;
        session.user.emailVerified = (token.emailVerified as Date) || null;
        session.user.accountStatus = token.accountStatus as AccountStatus;
        session.user.name = token.name || "";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path.startsWith("/admin")) return isLoggedIn && role === "ADMIN";
      if (path.startsWith("/resident")) return isLoggedIn;
      return true;
    },
  },
});

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

/**
 * Require an authenticated user. Doesn't check role or status.
 * Useful for routes accessible to any signed-in user (e.g., /auth/verification-pending).
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  return user;
}

/**
 * Require an APPROVED user of any role. Used for shared
 * authenticated routes that aren't role-specific.
 */
export async function requireApprovedUser() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountStatus: true,
      plotNumber: true,
    },
  });

  if (!user) redirect("/auth/signin");

  if (user.accountStatus === "PENDING") {
    redirect("/auth/verification-pending");
  }
  if (user.accountStatus === "SUSPENDED") {
    redirect("/auth/signin?error=suspended");
  }

  return user;
}

/**
 * Require an APPROVED RESIDENT user.
 * Pending → /auth/verification-pending
 * Suspended → /auth/signin?error=suspended
 * Wrong role → /admin/ledger
 */
export async function requireResident() {
  const user = await requireApprovedUser();

  if (user.role !== "RESIDENT") {
    redirect("/admin/ledger");
  }

  return user;
}

/**
 * Require an APPROVED ADMIN user.
 * Pending → /auth/verification-pending
 * Suspended → /auth/signin?error=suspended
 * Wrong role → /resident
 */
export async function requireAdmin() {
  const user = await requireApprovedUser();

  if (user.role !== "ADMIN") {
    redirect("/resident");
  }

  return user;
}
