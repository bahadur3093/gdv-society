import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export default function TMANotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-warning" />
      </div>
      <h1 className="text-h2 font-bold text-text-primary">Page not found</h1>
      <p className="text-body-sm text-text-muted max-w-xs">
        That route doesn&apos;t exist in the Telegram app.
      </p>
      <Link
        href={"/telegram-app/inbox"}
        className={cn(
          "inline-flex items-center gap-2 px-5 h-11 rounded-full",
          "bg-(image:--gradient-brand) text-white font-semibold",
          "shadow-md",
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inbox
      </Link>
    </div>
  );
}
