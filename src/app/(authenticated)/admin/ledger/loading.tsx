import Card from "@/components/atoms/Card";
import Skeleton, {
  SkeletonHeading,
  SkeletonText,
} from "@/components/atoms/Skeleton";
import StatCard from "@/components/molecules/StatCard";

export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <SkeletonHeading size="h1" width="40%" />
        <SkeletonText size="md" width="70%" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} label="" value="" loading />
        ))}
      </div>

      <Card padding="md">
        <div className="space-y-3">
          <SkeletonText width="30%" size="md" />
          <SkeletonText width="50%" size="sm" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton width={40} height={16} />
                <div className="flex-1 space-y-1">
                  <SkeletonText width="60%" size="sm" />
                  <SkeletonText width="40%" size="sm" />
                </div>
                <Skeleton width={80} height={16} />
                <Skeleton width={70} height={20} shape="pill" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
