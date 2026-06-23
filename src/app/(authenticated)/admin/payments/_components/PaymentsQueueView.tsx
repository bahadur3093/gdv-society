'use client';

import { useState, useMemo } from 'react';
import {
  Clock, CheckCircle2, XCircle, Inbox,
  Smartphone, Banknote, Building2, FileText, MoreHorizontal,
} from 'lucide-react';
import ProTable, { type ProTableColumn } from '@/components/pro-table/ProTable';
import type {
  AdminPaymentRequestRow,
  AdminPaymentRequestsCounts,
} from '@/lib/billing/getAdminPaymentRequests';

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

interface Props {
  rows: AdminPaymentRequestRow[];
  counts: AdminPaymentRequestsCounts;
}

export default function PaymentsQueueView({ rows, counts }: Props) {
  const [filter, setFilter] = useState<StatusFilter>(
    counts.pending > 0 ? 'PENDING' : 'ALL'
  );
  const [selectedRequest, setSelectedRequest] =
    useState<AdminPaymentRequestRow | null>(null);

  // ─── Filter by status ───
  const filtered = useMemo(() => {
    if (filter === 'ALL') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  // ─── Tabs ───
  const tabs: TabItem[] = [
    {
      key: 'PENDING',
      label: 'Pending',
      icon: <Clock />,
      badge:
        counts.pending > 0
          ? { label: String(counts.pending), variant: 'danger' }
          : undefined,
    },
    {
      key: 'APPROVED',
      label: 'Approved',
      icon: <CheckCircle2 />,
      badge:
        counts.approved > 0
          ? { label: String(counts.approved), variant: 'neutral' }
          : undefined,
    },
    {
      key: 'REJECTED',
      label: 'Rejected',
      icon: <XCircle />,
      badge:
        counts.rejected > 0
          ? { label: String(counts.rejected), variant: 'neutral' }
          : undefined,
    },
    {
      key: 'ALL',
      label: 'All',
      badge:
        counts.total > 0
          ? { label: String(counts.total), variant: 'neutral' }
          : undefined,
    },
  ];

  // ─── Columns ───
  const columns: ProTableColumn<AdminPaymentRequestRow>[] = useMemo(
    () => [
      {
        key: 'submittedAt',
        label: 'Submitted',
        sortable: true,
        sortAccessor: (r) => new Date(r.submittedAt).getTime(),
        desktop: (r) => (
          <div>
            <div className="text-text-primary">
              {new Date(r.submittedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </div>
            <div className="text-text-muted text-xs">
              {formatRelativeTime(r.submittedAt)}
            </div>
          </div>
        ),
      },
      {
        key: 'resident',
        label: 'Villa / Resident',
        sortable: true,
        sortAccessor: (r) => r.villaNo,
        desktop: (r) => (
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              name={r.residentName ?? r.villaOwnerName}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-medium text-text-primary">
                  Villa {r.villaNo}
                </span>
                <span className="text-text-secondary truncate">
                  {r.residentName ?? r.villaOwnerName}
                </span>
              </div>
              {r.residentEmail && (
                <div className="text-text-muted text-xs truncate max-w-50">
                  {r.residentEmail}
                </div>
              )}
            </div>
          </div>
        ),
        mobilePrimary: (r) => `Villa ${r.villaNo}`,
        mobileSecondary: (r) => r.residentName ?? r.villaOwnerName,
      },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        sortable: true,
        sortAccessor: (r) => r.amount,
        desktop: (r) => (
          <div>
            <div className="font-mono font-semibold text-text-primary">
              {formatCurrency(r.amount)}
            </div>
            <div className="text-text-muted text-xs">
              of {formatCurrency(r.villaOutstanding)} owed
            </div>
          </div>
        ),
        mobileAccent: (r) => (
          <span className="font-mono font-semibold text-text-primary">
            {formatCurrency(r.amount)}
          </span>
        ),
      },
      {
        key: 'method',
        label: 'Method',
        desktop: (r) => <MethodPill method={r.method} />,
        hideOn: ['mobile', 'tablet'],
      },
      {
        key: 'reference',
        label: 'Reference',
        desktop: (r) =>
          r.reference ? (
            <span className="font-mono text-text-secondary text-body-sm truncate max-w-35 inline-block">
              {r.reference}
            </span>
          ) : (
            <span className="text-text-muted">—</span>
          ),
        hideOn: ['mobile', 'tablet'],
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (r) => r.status,
        desktop: (r) => <StatusBadge status={r.status} />,
        mobileBadge: (r) => <StatusBadge status={r.status} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Tabs
        items={tabs}
        value={filter}
        onChange={(v) => setFilter(v as StatusFilter)}
        variant="underline"
        size="md"
      />

      {filtered.length === 0 ? (
        <EmptyContent filter={filter} />
      ) : (
        <ProTable<AdminPaymentRequestRow>
          data={filtered}
          columns={columns}
          rowKey="id"
          search
          searchPlaceholder="Search by villa, name, reference..."
          searchKeys={['villaNo', 'residentName', 'villaOwnerName', 'reference']}
          density="comfortable"
          stickyHeader
          maxHeight="70vh"
          actions={(row) => [
            {
              label: 'Review',
              icon: <ChevronRight />,
              onClick: (r) => setSelectedRequest(r),
            },
          ]}
        />
      )}

      {/* Review sheet/modal */}
      {selectedRequest && (
        <ReviewRequestSheet
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Method pill
// ─────────────────────────────────────────────────────────────

function MethodPill({ method }: { method: string }) {
  const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.OTHER;
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

const METHOD_CONFIG: Record<string, { label: string; icon: typeof Smartphone }> = {
  UPI: { label: 'UPI', icon: Smartphone },
  BANK_TRANSFER: { label: 'Bank Transfer', icon: Building2 },
  CASH: { label: 'Cash', icon: Banknote },
  CHEQUE: { label: 'Cheque', icon: FileText },
  OTHER: { label: 'Other', icon: MoreHorizontal },
};

// ─────────────────────────────────────────────────────────────
//  Status badge
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING: { label: 'Pending', variant: 'warning' as const, icon: <Clock /> },
    APPROVED: { label: 'Approved', variant: 'success' as const, icon: <CheckCircle2 /> },
    REJECTED: { label: 'Rejected', variant: 'danger' as const, icon: <XCircle /> },
    CANCELLED: { label: 'Cancelled', variant: 'neutral' as const, icon: <XCircle /> },
  }[status] ?? { label: status, variant: 'neutral' as const, icon: <Inbox /> };

  return (
    <Badge size="sm" variant={config.variant} icon={config.icon}>
      {config.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
//  Empty content (per filter)
// ─────────────────────────────────────────────────────────────

function EmptyContent({ filter }: { filter: StatusFilter }) {
  const config = {
    PENDING: {
      icon: <CheckCircle2 />,
      title: 'No pending requests',
      description: 'All payment requests have been reviewed. Nice work!',
      tone: 'success' as const,
    },
    APPROVED: {
      icon: <Inbox />,
      title: 'No approved requests yet',
      description: 'Approved payments will appear here.',
      tone: 'info' as const,
    },
    REJECTED: {
      icon: <Inbox />,
      title: 'No rejected requests',
      description: 'Rejected payments will appear here.',
      tone: 'info' as const,
    },
    ALL: {
      icon: <Inbox />,
      title: 'No payment requests yet',
      description:
        'When residents submit payment requests, they will show up here for verification.',
      tone: 'info' as const,
    },
  }[filter];

  return (
    <div className="p-8 rounded-md border border-border-subtle bg-bg-elevated">
      <EmptyState
        size="md"
        icon={config.icon}
        title={config.title}
        description={config.description}
        tone={config.tone}
      />
    </div>
  );
}

// Need ChevronRight for action icon
import { ChevronRight } from 'lucide-react';
import Tabs, { TabItem } from '@/components/molecules/Tabs';import { formatCurrency, formatRelativeTime } from '@/lib/utils/utils';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import EmptyState from '@/components/organisms/EmptyState';
import ReviewRequestSheet from './ReviewRequestSheet';

