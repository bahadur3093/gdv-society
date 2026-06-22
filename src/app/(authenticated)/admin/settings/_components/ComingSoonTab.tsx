import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function ComingSoonTab({ icon, title, description }: Props) {
  return (
    <Card padding="lg">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        tone="info"
        size="md"
      />
    </Card>
  );
}
