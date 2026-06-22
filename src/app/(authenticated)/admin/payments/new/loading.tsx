import Card from "@/components/atoms/Card";
import { SkeletonHeading, SkeletonText } from "@/components/atoms/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <SkeletonHeading size="h1" width="40%" />
        <SkeletonText width="60%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-7 space-y-6">
          <Card padding="md">
            <SkeletonText width="30%" />
            <div className="h-12 mt-3 bg-bg-sunken rounded animate-pulse" />
          </Card>
          <Card padding="md">
            <SkeletonText width="40%" />
            <div className="h-12 mt-3 bg-bg-sunken rounded animate-pulse" />
            <div className="h-10 mt-3 bg-bg-sunken rounded animate-pulse" />
          </Card>
        </div>
        <div className="md:col-span-5">
          <Card padding="md">
            <SkeletonText width="50%" />
            <div className="space-y-2 mt-4">
              <SkeletonText width="80%" />
              <SkeletonText width="70%" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
