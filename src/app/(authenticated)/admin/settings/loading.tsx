import Card from "@/components/atoms/Card";
import { SkeletonHeading, SkeletonText } from "@/components/atoms/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <SkeletonHeading size="h1" width="20%" />
        <SkeletonText width="50%" />
      </div>

      <div className="h-12 bg-bg-sunken rounded animate-pulse" />

      <Card padding="md">
        <div className="space-y-4">
          <SkeletonText width="40%" />
          <div className="h-12 bg-bg-sunken rounded animate-pulse" />
          <div className="h-12 bg-bg-sunken rounded animate-pulse" />
        </div>
      </Card>

      <Card padding="md">
        <div className="space-y-4">
          <SkeletonText width="30%" />
          <div className="h-12 bg-bg-sunken rounded animate-pulse" />
        </div>
      </Card>
    </div>
  );
}
