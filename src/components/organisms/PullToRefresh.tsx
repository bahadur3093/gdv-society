"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Loader2, RefreshCw } from "lucide-react";
import { toast } from "../atoms/Toast";
import { cn } from "@/lib/utils/utils";

const PULL_THRESHOLD = 80;
const MAX_PULL = 140; // Cap elastic stretch
const RESISTANCE = 0.5; // Slower past threshold

interface PullToRefreshProps {
  children: ReactNode;
  /** Additional className for the scroll container */
  className?: string;
  /** Disable pull-to-refresh entirely */
  disabled?: boolean;
}

export default function PullToRefresh({
  children,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const hasTriggered = useRef(false);

  // ─── Check if pull-to-refresh should activate ───
  const shouldActivate = useCallback((): boolean => {
    if (disabled || isRefreshing) return false;

    // Must be at top of page (window scroll)
    if (window.scrollY > 0) return false;

    // Must be at top of any internal scroll containers
    if (document.documentElement.scrollTop > 0) return false;

    // Suppress when modals/sheets are open
    // Radix dialogs and vaul sheets add elements with role="dialog"
    const openDialog = document.querySelector(
      '[role="dialog"][data-state="open"]',
    );
    if (openDialog) return false;

    return true;
  }, [disabled, isRefreshing]);

  // ─── Refresh logic ───
  const performRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Check for service worker update
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // SW has new version waiting — activate it
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          toast.success("Updating to latest version…", {
            description: "Reloading the app…",
          });
          // Give toast time to show
          setTimeout(() => {
            window.location.reload();
          }, 600);
          return;
        }
      }

      // Soft refresh — re-runs server components
      router.refresh();

      // Small delay so the spinner is visible (not jarring)
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      hasTriggered.current = false;
    }
  }, [router]);

  // ─── Touch event handlers ───
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!shouldActivate()) return;
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
      hasTriggered.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only handle downward pulls
      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      // Cancel if user starts scrolling (window scrolled)
      if (window.scrollY > 0) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      // Calculate resistive pull distance
      let distance: number;
      if (deltaY <= PULL_THRESHOLD) {
        distance = deltaY;
      } else {
        // Apply resistance past threshold (rubber band effect)
        const excess = deltaY - PULL_THRESHOLD;
        distance = PULL_THRESHOLD + excess * RESISTANCE;
      }

      // Cap at MAX_PULL
      distance = Math.min(distance, MAX_PULL);

      // Prevent default scroll behavior while pulling
      if (distance > 5) {
        e.preventDefault();
      }

      setPullDistance(distance);
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      setIsPulling(false);

      if (pullDistance >= PULL_THRESHOLD && !hasTriggered.current) {
        hasTriggered.current = true;
        performRefresh();
      } else {
        // Snap back
        setPullDistance(0);
      }
    };

    const handleTouchCancel = () => {
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    disabled,
    isRefreshing,
    pullDistance,
    isPulling,
    shouldActivate,
    performRefresh,
  ]);

  // ─── Computed values for visual state ───
  const isReady = pullDistance >= PULL_THRESHOLD;
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorOpacity = Math.min(pullDistance / 40, 1);
  const arrowRotation = isReady ? 180 : 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      // Disable browser pull-to-refresh on Chrome Android (don't want double behavior)
      style={{
        overscrollBehaviorY: "contain",
        touchAction: "pan-y",
      }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "pointer-events-none",
          "absolute top-0 left-0 right-0",
          "flex flex-col items-center justify-end",
          "overflow-hidden",
          "z-50",
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? PULL_THRESHOLD : 0)}px`,
          transition:
            isPulling || isRefreshing
              ? "none"
              : "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-1.5",
            "pb-2",
            "transition-opacity duration-200",
          )}
          style={{
            opacity: isRefreshing ? 1 : indicatorOpacity,
          }}
        >
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-bg-elevated border border-border-default",
              "flex items-center justify-center",
              "shadow-sm",
              "transition-colors duration-200",
              isReady &&
                !isRefreshing &&
                "bg-brand-primary/15 border-brand-primary/40",
            )}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <ArrowDown
                className={cn(
                  "w-4 h-4",
                  "transition-all duration-200",
                  isReady ? "text-brand-primary" : "text-text-secondary",
                )}
                style={{
                  transform: `rotate(${arrowRotation}deg)`,
                }}
              />
            )}
          </div>

          {/* Message */}
          <p
            className={cn(
              "text-micro uppercase tracking-wider font-medium",
              "whitespace-nowrap",
              "transition-colors duration-200",
              isReady && !isRefreshing
                ? "text-brand-primary"
                : "text-text-muted",
            )}
          >
            {isRefreshing
              ? "Refreshing…"
              : isReady
                ? "Release to refresh"
                : "Pull to refresh"}
          </p>
        </div>
      </div>

      {/* Content (translated down by pull distance) */}
      <div
        style={{
          transform: `translateY(${
            isRefreshing ? PULL_THRESHOLD : pullDistance
          }px)`,
          transition:
            isPulling || isRefreshing
              ? "none"
              : "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
