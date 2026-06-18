import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { getLandingPath } from "@/lib/auth/redirect";
import SignInForm from "@/components/templates/SignInForm";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect(getLandingPath(session));
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
