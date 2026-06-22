import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";

interface ComingSoonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export default function ComingSoon({
  icon,
  title,
  description,
  backHref = "/resident",
  backLabel = "Back to dashboard",
}: ComingSoonProps) {
  return (
    <Card padding="lg">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        tone="info"
        size="lg"
        action={{
          label: backLabel,
          href: backHref,
        }}
      />
    </Card>
  );
}
