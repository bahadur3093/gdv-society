import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path.startsWith("/auth/")) return true;
      if (path === "/maintenance-calculator") return true;

      if (path.startsWith("/admin")) return isLoggedIn && role === "ADMIN";
      if (path.startsWith("/resident")) return isLoggedIn;

      return isLoggedIn; // everything else needs login
    },
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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plotNumber = token.plotNumber;
        session.user.emailVerified = token.emailVerified || null;
        session.user.name = token.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
