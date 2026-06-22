import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import Card from "@/components/atoms/Card";
import { cn } from "@/lib/utils/utils";

export default function HelpDeskCard() {
  return (
    <Card asChild interactive padding="md" className="hidden md:block">
      <Link
        href={"/resident/requests"}
        className={cn(
          "block",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          "focus-visible:ring-offset-bg-base",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-md",
              "bg-info/15 text-info",
              "flex items-center justify-center",
            )}
          >
            <LifeBuoy className="w-5 h-5" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-body font-semibold text-text-primary">
              Need help?
            </p>
            <p className="text-body-sm text-text-secondary mt-0.5">
              Raise a request and the society admin will get back to you.
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-3",
                "text-body-sm font-medium text-brand-primary",
              )}
            >
              Open Help Desk <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
