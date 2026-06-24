"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  BookOpen,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  Users,
  Home,
  AlertTriangle,
  Hourglass,
} from "lucide-react";
import Tabs, { type TabItem } from "@/components/molecules/Tabs";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import { resetResidentPasswordAction } from "../actions";
import type {
  AdminResidentRow,
  AdminResidentsCounts,
} from "@/lib/users/getAdminResidents";
import { toast } from "@/components/atoms/Toast";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";

type StatusFilter = "ALL" | "PENDING" | "CLAIMED" | "UNCLAIMED" | "UNVERIFIED";

interface Props {
  rows: AdminResidentRow[];
  counts: AdminResidentsCounts;
}

export default function ResidentsListView({ rows, counts }: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [resetTarget, setResetTarget] = useState<AdminResidentRow | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // ─── Filter rows ───
  const filtered = useMemo(() => {
    switch (filter) {
      case "PENDING":
        return rows.filter((r) => r.accountStatus === "PENDING");
      case "CLAIMED":
        return rows.filter((r) => r.isClaimed);
      case "UNCLAIMED":
        return rows.filter((r) => !r.isClaimed);
      case "UNVERIFIED":
        return rows.filter((r) => !r.emailVerified);
      case "ALL":
      default:
        return rows;
    }
  }, [rows, filter]);

  // ─── Tabs ───
  const tabs: TabItem[] = [
    {
      key: "ALL",
      label: "All",
      badge:
        counts.all > 0
          ? { label: String(counts.all), variant: "neutral" }
          : undefined,
    },
    {
      key: "CLAIMED",
      label: "Claimed",
      icon: <Home />,
      badge:
        counts.claimed > 0
          ? { label: String(counts.claimed), variant: "success" }
          : undefined,
    },
    {
      key: "UNCLAIMED",
      label: "Unclaimed",
      icon: <AlertCircle />,
      badge:
        counts.unclaimed > 0
          ? { label: String(counts.unclaimed), variant: "warning" }
          : undefined,
    },
    {
      key: "UNVERIFIED",
      label: "Unverified",
      icon: <Mail />,
      badge:
        counts.unverified > 0
          ? { label: String(counts.unverified), variant: "danger" }
          : undefined,
    },

    {
      key: "PENDING",
      label: "Pending approval",
      icon: <Hourglass />,
      badge:
        counts.pending > 0
          ? { label: String(counts.pending), variant: "warning" }
          : undefined,
    },
  ];

  // ─── Reset password handler ───
  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    const result = await resetResidentPasswordAction(resetTarget.id);
    setIsResetting(false);

    if (result.status === "success") {
      toast.success("Password reset link generated", {
        description: result.message,
      });
      setResetTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to generate reset link");
    }
  };

  // ─── Columns ───
  const columns: ProTableColumn<AdminResidentRow>[] = useMemo(
    () => [
      {
        key: "resident",
        label: "Resident",
        sortable: true,
        sortAccessor: (r) => r.name,
        desktop: (r) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size="md" name={r.name} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-text-primary truncate">
                  {r.name}
                </span>
                {!r.emailVerified && (
                  <span title="Email not verified">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-text-muted text-xs truncate max-w-55">
                {r.email}
              </div>
            </div>
          </div>
        ),
        mobilePrimary: (r) => r.name,
        mobileSecondary: (r) => r.email,
      },
      {
        key: "villa",
        label: "Villa",
        sortable: true,
        sortAccessor: (r) => r.villaNo ?? 9999, // unclaimed sorts last
        desktop: (r) =>
          r.isClaimed ? (
            <div>
              <div className="font-mono font-medium text-text-primary">
                {r.villaNo}
              </div>
              <div className="text-text-muted text-xs">{r.villaSqFt} sqft</div>
            </div>
          ) : (
            <span className="text-text-muted text-body-sm italic">
              Unclaimed
            </span>
          ),
        hideOn: ["mobile"],
      },
      {
        key: "outstanding",
        label: "Outstanding",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.outstandingBalance,
        desktop: (r) =>
          r.isClaimed ? (
            <div className="text-right">
              <div
                className={cn(
                  "font-mono font-semibold",
                  r.outstandingBalance > 0
                    ? "text-danger"
                    : "text-text-primary",
                )}
              >
                {formatCurrency(r.outstandingBalance)}
              </div>
              {r.unpaidBillsCount > 0 && (
                <div className="text-text-muted text-xs">
                  {r.unpaidBillsCount} unpaid bill
                  {r.unpaidBillsCount === 1 ? "" : "s"}
                </div>
              )}
            </div>
          ) : (
            <span className="text-text-muted">—</span>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "family",
        label: "Family",
        sortable: true,
        sortAccessor: (r) => r.familyMemberCount,
        desktop: (r) => (
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-3.5 h-3.5" />
            <span>{r.familyMemberCount}</span>
          </div>
        ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "lastPayment",
        label: "Last Payment",
        sortable: true,
        sortAccessor: (r) => r.lastPaymentDate?.getTime() ?? 0,
        desktop: (r) =>
          r.lastPaymentDate ? (
            <div>
              <div className="text-text-primary text-body-sm">
                {r.lastPaymentDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
              </div>
              <div className="text-text-muted text-xs">
                {formatRelativeTime(r.lastPaymentDate)}
              </div>
            </div>
          ) : (
            <span className="text-text-muted text-body-sm">Never</span>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "status",
        label: "Status",
        desktop: (r) => (
          <div className="flex flex-col gap-1 items-start">
            {r.accountStatus === "PENDING" && (
              <Badge size="sm" variant="warning" icon={<Hourglass />}>
                Pending approval
              </Badge>
            )}
            {r.accountStatus === "SUSPENDED" && (
              <Badge size="sm" variant="danger">
                Suspended
              </Badge>
            )}
            {r.isClaimed ? (
              <Badge size="sm" variant="success" icon={<CheckCircle2 />}>
                Linked
              </Badge>
            ) : (
              <Badge size="sm" variant="warning" icon={<AlertCircle />}>
                Unlinked
              </Badge>
            )}
            {!r.emailVerified && (
              <Badge size="sm" variant="danger" icon={<XCircle />}>
                Unverified
              </Badge>
            )}
            {r.pendingRequestsCount > 0 && (
              <Badge size="sm" variant="info">
                {r.pendingRequestsCount} pending request
                {r.pendingRequestsCount === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
        ),
        mobileBadge: (r) =>
          r.isClaimed ? (
            <Badge size="sm" variant="success">
              Linked
            </Badge>
          ) : (
            <Badge size="sm" variant="warning">
              Unlinked
            </Badge>
          ),
      },
    ],
    [],
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

      <ProTable<AdminResidentRow>
        data={filtered}
        columns={columns}
        rowKey="id"
        search
        searchPlaceholder="Search by name or email…"
        searchKeys={["name", "email", "plotNumber"]}
        density="comfortable"
        stickyHeader
        maxHeight="70vh"
        emptyTitle={
          filter === "ALL"
            ? "No residents yet"
            : filter === "CLAIMED"
              ? "No claimed villas"
              : filter === "UNCLAIMED"
                ? "All residents have linked villas"
                : "All residents are verified"
        }
        emptyDescription={
          filter === "ALL"
            ? "When residents register, they will appear here."
            : "Try a different filter."
        }
        actions={(row) => [
          {
            label: "View profile",
            icon: <Eye />,
            href: () => `/admin/residents/${row.id}`,
          },
          ...(row.isClaimed
            ? [
                {
                  label: "View ledger",
                  icon: <BookOpen />,
                  href: () => `/admin/ledger/${row.id}`,
                },
              ]
            : []),
          {
            label: "Reset password",
            icon: <KeyRound />,
            onClick: () => setResetTarget(row),
          },
        ]}
      />

      {/* Reset password confirmation modal */}
      <Modal
        open={!!resetTarget}
        onOpenChange={(open) => !open && !isResetting && setResetTarget(null)}
        title="Reset password?"
        description={
          resetTarget
            ? `Generate a password reset link for ${resetTarget.name} (${resetTarget.email}). They can use it within 24 hours.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setResetTarget(null)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<KeyRound className="w-4 h-4" />}
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? "Generating…" : "Generate reset link"}
            </Button>
          </>
        }
      />
    </div>
  );
}
