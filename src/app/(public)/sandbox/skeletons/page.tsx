'use client';

import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Skeleton, { SkeletonAvatar, SkeletonButton, SkeletonCard, SkeletonHeading, SkeletonParagraph, SkeletonText } from '@/components/atoms/Skeleton';
import { useState } from 'react';

export default function SkeletonsSandbox() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Skeleton</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Loading placeholders with shimmer animation. Composable from primitive to full layouts.
        </p>
      </header>

      {/* ─── Toggle for live demo ─── */}
      <div className="flex items-center gap-3">
        <Button onClick={() => setLoading((l) => !l)}>
          {loading ? 'Show Real Content' : 'Show Skeletons'}
        </Button>
        <p className="text-body-sm text-text-secondary">
          Toggle to see the real → skeleton swap
        </p>
      </div>

      {/* ─── Base Skeleton (any shape/size) ─── */}
      <Section title="Base Skeleton (raw primitive)">
        <div className="space-y-3">
          <Skeleton width={200} height={20} />
          <Skeleton width="100%" height={40} />
          <Skeleton width={64} height={64} shape="circle" />
          <Skeleton width={120} height={32} shape="pill" />
        </div>
      </Section>

      {/* ─── Text Variants ─── */}
      <Section title="Text Skeletons">
        <div className="space-y-3 max-w-md">
          <SkeletonText size="sm" />
          <SkeletonText size="md" />
          <SkeletonText size="lg" />
          <SkeletonText size="md" width="100%" />
          <SkeletonText size="md" width="30%" />
        </div>
      </Section>

      {/* ─── Headings ─── */}
      <Section title="Heading Skeletons">
        <div className="space-y-3 max-w-md">
          <SkeletonHeading size="h1" />
          <SkeletonHeading size="h2" />
          <SkeletonHeading size="h3" />
          <SkeletonHeading size="h4" />
        </div>
      </Section>

      {/* ─── Paragraphs ─── */}
      <Section title="Paragraph (multi-line)">
        <div className="space-y-6 max-w-md">
          <div>
            <p className="text-body-sm text-text-muted mb-2">2 lines</p>
            <SkeletonParagraph lines={2} />
          </div>
          <div>
            <p className="text-body-sm text-text-muted mb-2">4 lines</p>
            <SkeletonParagraph lines={4} />
          </div>
        </div>
      </Section>

      {/* ─── Avatars ─── */}
      <Section title="Avatar Skeletons (all sizes)">
        <div className="flex items-end gap-3">
          <SkeletonAvatar size="xs" />
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
          <SkeletonAvatar size="xl" />
          <SkeletonAvatar size="2xl" />
        </div>
        <p className="text-body-sm text-text-muted mt-3">
          Matches Avatar component sizes 1:1
        </p>

        <div className="flex items-center gap-3 mt-4">
          <SkeletonAvatar size="lg" shape="circle" />
          <SkeletonAvatar size="lg" shape="square" />
        </div>
      </Section>

      {/* ─── Buttons ─── */}
      <Section title="Button Skeletons (all sizes + shapes)">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonButton size="sm" />
            <SkeletonButton size="md" />
            <SkeletonButton size="lg" />
            <SkeletonButton size="xl" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonButton size="md" buttonShape="default" />
            <SkeletonButton size="md" buttonShape="pill" width={140} />
            <SkeletonButton size="md" buttonShape="square" />
          </div>
          <SkeletonButton fullWidth size="lg" buttonShape="pill" />
        </div>
      </Section>

      {/* ─── Pulse fallback (no shimmer) ─── */}
      <Section title="No Shimmer (gentle pulse)">
        <div className="space-y-3 max-w-md">
          <SkeletonParagraph lines={3} noShimmer />
        </div>
        <p className="text-body-sm text-text-muted mt-3">
          Use noShimmer for sidebar/peripheral skeletons (less distracting).
        </p>
      </Section>

      {/* ─── SkeletonCard (composite) ─── */}
      <Section title="SkeletonCard (full layout)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard showActions lines={3} />
        </div>
      </Section>

      {/* ─── Real-world: Toggle real ↔ skeleton ─── */}
      <Section title="Real-World: User Card Loading State">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <>
              <UserCardSkeleton />
              <UserCardSkeleton />
            </>
          ) : (
            <>
              <UserCardReal
                name="Bahadur Singh"
                role="Owner • Villa 39"
                statusText="Active"
              />
              <UserCardReal
                name="Priya Sharma"
                role="Tenant • Villa 12"
                statusText="Verified"
              />
            </>
          )}
        </div>
      </Section>

      {/* ─── Real-world: Table loading ─── */}
      <Section title="Real-World: Table Loading">
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle text-body-sm text-text-muted">
                <th className="text-left p-3 font-medium">Villa</th>
                <th className="text-left p-3 font-medium">Resident</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border-subtle last:border-0">
                      <td className="p-3">
                        <SkeletonText size="md" width={40} />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <SkeletonAvatar size="sm" />
                          <SkeletonText size="md" width="60%" />
                        </div>
                      </td>
                      <td className="p-3 flex justify-end">
                        <SkeletonText size="md" width={70} />
                      </td>
                      <td className="p-3">
                        <SkeletonButton size="sm" buttonShape="pill" width={70} />
                      </td>
                    </tr>
                  ))
                : [
                    { villa: 39, name: 'Bahadur Singh', amount: '₹6,320', status: 'partial' },
                    { villa: 12, name: 'Priya Sharma', amount: '₹3,000', status: 'pending' },
                    { villa: 5, name: 'Ramesh Kumar', amount: '₹0', status: 'paid' },
                    { villa: 23, name: 'Anita Verma', amount: '₹4,800', status: 'overdue' },
                    { villa: 7, name: 'Sanjay Patel', amount: '₹2,400', status: 'partial' },
                  ].map((row) => (
                    <tr key={row.villa} className="border-b border-border-subtle last:border-0">
                      <td className="p-3 font-mono text-body text-text-secondary">
                        {row.villa}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" name={row.name} />
                          <span className="text-body text-text-primary">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-body text-text-primary">
                        {row.amount}
                      </td>
                      <td className="p-3">
                        <Badge
                          size="sm"
                          variant={
                            row.status === 'paid'
                              ? 'success'
                              : row.status === 'partial'
                              ? 'warning'
                              : row.status === 'pending'
                              ? 'neutral'
                              : 'danger'
                          }
                          dot={row.status === 'pending'}
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </Card>
      </Section>

      {/* ─── Real-world: Resident home hero ─── */}
      <Section title="Real-World: Resident Home Loading">
        <Card variant="gradient" padding="lg" className="max-w-md">
          {loading ? (
            <div className="space-y-4">
              <SkeletonText size="sm" width={80} />
              <SkeletonHeading size="h1" width="60%" />
              <SkeletonText size="md" width="80%" />
              <SkeletonButton fullWidth size="xl" buttonShape="pill" />
            </div>
          ) : (
            <div>
              <p className="text-micro uppercase text-text-muted">YOU OWE</p>
              <p className="text-display-1 font-mono text-gradient-brand mt-2">
                ₹6,320
              </p>
              <p className="text-body text-text-secondary mt-1">
                2 unpaid bills • next due Jun 10
              </p>
              <Button
                variant="gradient"
                size="xl"
                shape="pill"
                fullWidth
                className="mt-6"
              >
                Pay Now
              </Button>
            </div>
          )}
        </Card>
      </Section>
    </div>
  );
}

// ─── Helpers ───
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-h3 text-text-primary border-b border-border-subtle pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function UserCardSkeleton() {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <SkeletonHeading size="h4" width="60%" />
          <SkeletonText size="sm" width="40%" />
        </div>
        <SkeletonButton size="sm" buttonShape="pill" width={60} />
      </div>
    </Card>
  );
}

function UserCardReal({
  name,
  role,
  statusText,
}: {
  name: string;
  role: string;
  statusText: string;
}) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <Avatar size="lg" name={name} status="online" />
        <div className="flex-1 min-w-0">
          <p className="text-h4 text-text-primary truncate">{name}</p>
          <p className="text-body-sm text-text-secondary truncate">{role}</p>
        </div>
        <Badge variant="success" size="sm">{statusText}</Badge>
      </div>
    </Card>
  );
}