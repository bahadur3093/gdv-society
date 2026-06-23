import Card from "@/components/atoms/Card";
import { SkeletonHeading, SkeletonText } from "@/components/atoms/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      <div className="space-y-2">
        <SkeletonHeading size="h1" width="30%" />
        <SkeletonText width="50%" />
      </div>
      <div className="h-12 bg-bg-sunken rounded" />
      <Card padding="md">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-bg-sunken rounded" />
          ))}
        </div>
      </Card>
    </div>
  );
}
