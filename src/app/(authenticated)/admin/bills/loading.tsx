import Card from "@/components/atoms/Card";
import { SkeletonHeading, SkeletonText } from "@/components/atoms/Skeleton";
import StatCard from "@/components/molecules/StatCard";

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <SkeletonHeading size="h1" width="40%" />
        <SkeletonText width="60%" />
      </div>

      <Card padding="md">
        <SkeletonText width="50%" size="md" />
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} label="" value="" loading />
        ))}
      </div>

      <Card padding="md">
        <SkeletonText width="40%" />
      </Card>
    </div>
  );
}