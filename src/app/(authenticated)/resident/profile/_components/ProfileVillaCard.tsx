import {
  Home, Ruler, User, Info, AlertCircle,
} from 'lucide-react';
import type { ResidentProfileData } from '@/lib/users/getResidentProfile';
import Section from '@/components/organisms/Section';
import Card from '@/components/atoms/Card';
import EmptyState from '@/components/organisms/EmptyState';

interface Props {
  villa: ResidentProfileData['villa'];
}

export default function ProfileVillaCard({ villa }: Props) {
  return (
    <Section
      title="Your Villa"
      description="Linked plot details (managed by admin)"
      icon={<Home />}
    >
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
            <p className="text-body-sm text-text-secondary mt-1">{villa.type}</p>
          </div>

          {/* Details */}
          <dl className="space-y-3 mt-4">
            <DetailRow
              icon={<Ruler />}
              label="Carpet area"
              value={`${villa.areaInSqFt.toLocaleString('en-IN')} sqft`}
            />
            <DetailRow
              icon={<User />}
              label="Owner on record"
              value={villa.ownerName}
            />
          </dl>

          {/* Admin hint */}
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-start gap-2 text-body-sm text-text-muted">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>
                Villa details are managed by the society admin. To request a
                change (e.g., correct area), use the Help Desk.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<AlertCircle />}
            title="No villa linked"
            description="Contact the society admin to link your villa to your account."
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