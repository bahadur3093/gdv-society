import { cn } from "@/lib/utils/utils";

interface AuthBrandPanelProps {
  tagline: string;
  variant?: "default" | "success" | "time" | "security";
}

export default function AuthBrandPanel({
  tagline,
  variant = "default",
}: AuthBrandPanelProps) {
  return (
    <section
      className={cn(
        "hidden lg:flex",
        "lg:w-1/2",
        "relative overflow-hidden",
        "flex-col items-center justify-center",
        "p-12",
        "bg-bg-base",
      )}
      aria-hidden="true"
    >
      {/* Aurora mesh background */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(circle_at_20%_30%,hsla(263,66%,40%,0.18)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,hsla(328,81%,55%,0.12)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,hsla(220,60%,30%,0.08)_0%,transparent_60%)]",
        )}
      />

      {/* Floating orbs */}
      <div
        className={cn(
          "absolute top-[-10%] right-[-10%]",
          "w-96 h-96 rounded-full",
          "bg-brand-primary/20",
          "blur-[80px]",
          "animate-[float_20s_ease-in-out_infinite]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-20%] left-[-10%]",
          "w-125 h-125 rounded-full",
          "bg-brand-pink/15",
          "blur-[80px]",
          "animate-[float_25s_ease-in-out_infinite]",
        )}
        style={{ animationDelay: "-5s" }}
      />
      <div
        className={cn(
          "absolute top-[20%] left-[20%]",
          "w-64 h-64 rounded-full",
          "bg-info/10",
          "blur-[80px]",
          "animate-[float_22s_ease-in-out_infinite]",
        )}
        style={{ animationDelay: "-10s" }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
          color: "var(--color-text-primary)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Version pill */}
        <div
          className={cn(
            "inline-block mb-6",
            "px-4 py-1.5 rounded-full",
            "bg-bg-elevated/30 backdrop-blur-md",
            "border border-border-subtle",
          )}
        >
          <span className="text-micro font-mono uppercase tracking-widest text-brand-primary">
            Platform v2.0
          </span>
        </div>

        {/* Large GDV gradient text */}
        <h2
          className={cn(
            "text-[96px] leading-none font-bold tracking-tighter",
            "text-gradient-brand mb-2",
          )}
        >
          GDV
        </h2>

        {/* Sub-mark */}
        <p className="text-h2 text-text-primary opacity-90 tracking-tight mb-6">
          Society Hub
        </p>

        {/* Divider */}
        <div
          className={cn(
            "w-12 h-1 mx-auto mb-6 rounded-full",
            "bg-[image:var(--gradient-brand)]",
          )}
        />

        {/* Tagline */}
        <p className="text-body-lg text-text-secondary leading-relaxed">
          {tagline}
        </p>

        {/* Variant-specific decorations */}
        {variant === "time" && <TimeDecoration />}
        {variant === "success" && <SuccessDecoration />}
        {variant === "security" && <SecurityDecoration />}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Variant Decorations
// ─────────────────────────────────────────────────────────────

function TimeDecoration() {
  return (
    <div className="flex justify-center items-end gap-1 mt-8 h-12">
      {[4, 8, 12, 8, 4].map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-brand-primary",
            i === 2 ? "opacity-100" : "opacity-50",
          )}
          style={{
            height: `${h * 4}px`,
            animation: `bounce 2s infinite ${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

function SuccessDecoration() {
  return (
    <div className="flex justify-center mt-8">
      <div
        className={cn(
          "w-12 h-12 rounded-full",
          "bg-success/20",
          "flex items-center justify-center",
          "border border-success/40",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-success"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );
}

function SecurityDecoration() {
  return (
    <div className="flex justify-center mt-8">
      <div
        className={cn(
          "w-14 h-14 rounded-2xl",
          "bg-[image:var(--gradient-brand)]",
          "flex items-center justify-center",
          "shadow-2xl shadow-brand-primary/30",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 text-white"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    </div>
  );
}
