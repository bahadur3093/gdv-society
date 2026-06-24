// src/types/next-auth.d.ts
import type { UserRole } from "@/types/auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    plotNumber: string | null;
    emailVerified: Date | null;
    accountStatus: AccountStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      plotNumber: string | null;
      emailVerified: Date | null;
      accountStatus: AccountStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    plotNumber: string | null;
    emailVerified: Date | null;
    accountStatus: AccountStatus;
  }
}
