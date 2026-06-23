import { Users, Phone } from "lucide-react";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";

interface Props {
  members: AdminResidentDetail["familyMembers"];
}

export default function FamilyMembersList({ members }: Props) {
  return (
    <Section
      title="Family Members"
      description={
        members.length > 0 ? `${members.length} registered` : undefined
      }
      icon={<Users className="w-full h-full" />}
      badge={
        members.length > 0
          ? { label: String(members.length), variant: "neutral" }
          : undefined
      }
      size="md"
    >
      {members.length === 0 ? (
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<Users className="w-full h-full" />}
            title="No family members added"
            description="The resident can add family members from their profile."
          />
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border-subtle">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4"
              >
                <Avatar size="md" name={m.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-body font-medium text-text-primary truncate">
                      {m.name}
                    </span>
                    <Badge size="sm" variant="neutral" outline>
                      {m.relationship}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-body-sm text-text-muted">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">{m.contact}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Section>
  );
}
