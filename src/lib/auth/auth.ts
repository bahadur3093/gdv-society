import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types";
import { cache } from "react";
import { redirect } from "next/navigation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ EARLY EXIT: missing email or password");
          return null;
        }

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
        } as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plotNumber = user.plotNumber;
        token.emailVerified = user.emailVerified;
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

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  return user;
}

export async function requireResident() {
  const user = await requireUser();

  if (user.role !== "RESIDENT") {
    redirect("/admin");
  }

  if (!user.emailVerified) {
    redirect("/auth/verification-pending");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/resident");
  }

  return user;
}
