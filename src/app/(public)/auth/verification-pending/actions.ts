"use server";

import { signOut } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export async function signOutFromPendingAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/auth/signin");
}
