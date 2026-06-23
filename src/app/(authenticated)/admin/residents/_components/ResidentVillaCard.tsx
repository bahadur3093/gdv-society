import Link from "next/link";
import {
  Home,
  Ruler,
  User,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import { cn } from "@/lib/utils/utils";
import EmptyState from "@/components/organisms/EmptyState";

interface Props {
  villa: AdminResidentDetail["villa"];
}

export default function ResidentVillaCard({ villa }: Props) {
  return (
    <Section title="Villa" icon={<Home />} size="sm">
      {villa ? (
        <Card padding="md">
          {/* Big villa number */}
          <div className="text-center pb-4 border-b border-border-subtle">
            <p className="text-micro uppercase tracking-wider text-text-muted">
              Villa
            </p>
            <p className="text-display-2 font-mono font-bold text-brand-primary mt-1">
              {villa.villaNo}
            </p>
            <p className="text-body-sm text-text-secondary mt-1">
              {villa.type}
            </p>
          </div>

          {/* Details */}
          <dl className="space-y-3 mt-4">
            <DetailRow
              icon={<Ruler />}
              label="Carpet area"
              value={`${villa.areaInSqFt.toLocaleString("en-IN")} sqft`}
            />
            <DetailRow
              icon={<User />}
              label="Owner on record"
              value={villa.ownerName}
            />
          </dl>

          {/* Links */}
          <div className="mt-5 pt-4 border-t border-border-subtle space-y-2">
            <Link
              href={`/admin/ledger/${villa.id}`}
              className={cn(
                "flex items-center justify-between gap-2",
                "px-3 py-2 -mx-1 rounded",
                "hover:bg-bg-sunken transition-colors",
                "group",
              )}
            >
              <span className="text-body-sm text-text-primary inline-flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-muted" />
                View villa ledger
              </span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-text-muted",
                  "transition-transform duration-(--duration-fast)",
                  "group-hover:translate-x-0.5",
                )}
              />
            </Link>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<AlertCircle />}
            title="No villa linked"
            description="This resident hasn't been linked to a villa yet. Use the Edit button to link one."
            tone="warning"
          />
        </Card>
      )}
    </Section>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 h-5 inline-flex shrink-0 text-text-muted mt-0.5">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <dt className="text-body-sm text-text-muted">{label}</dt>
        <dd className="text-body text-text-primary truncate">{value}</dd>
      </div>
    </div>
  );
}
