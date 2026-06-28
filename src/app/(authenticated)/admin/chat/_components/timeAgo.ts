// filepath: src/app/(authenticated)/admin/chat/_components/timeAgo.ts

/**
 * Convert an ISO date string to a human-readable relative time.
 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Active now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString();
}