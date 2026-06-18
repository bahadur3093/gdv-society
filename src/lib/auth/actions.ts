"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";

export async function signInWithCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Invalid email or password" };
        default:
          return { ok: false, error: "Something went wrong" };
      }
    }
    throw error; // rethrow non-auth errors (Next.js redirect, etc.)
  }
}