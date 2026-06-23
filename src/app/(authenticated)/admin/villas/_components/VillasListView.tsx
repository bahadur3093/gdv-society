"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import { toggleVillaBillableAction, deleteVillaAction } from "../actions";
import EditVillaSheet from "./EditVillaSheet";
import type {
  AdminVillaRow,
  AdminVillasCounts,
} from "@/lib/villas/getAdminVillas";
import Tabs, { TabItem } from "@/components/molecules/Tabs";
import { toast } from "@/components/atoms/Toast";
import Avatar from "@/components/atoms/Avatar";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";

type StatusFilter =
  | "ALL"
  | "BILLABLE"
  | "NOT_BILLABLE"
  | "CLAIMED"
  | "UNCLAIMED";

interface Props {
  rows: AdminVillaRow[];
  counts: AdminVillasCounts;
}

export default function VillasListView({ rows, counts }: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<StatusFilter>("ALL");

  // Edit sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<AdminVillaRow | undefined>(
    undefined,
  );

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<AdminVillaRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Filter rows ───
  const filtered = useMemo(() => {
    switch (filter) {
      case "BILLABLE":
        return rows.filter((r) => r.isBillable);
      case "NOT_BILLABLE":
        return rows.filter((r) => !r.isBillable);
      case "CLAIMED":
        return rows.filter((r) => r.isClaimed);
      case "UNCLAIMED":
        return rows.filter((r) => !r.isClaimed);
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
      key: "BILLABLE",
      label: "Billable",
      icon: <CheckCircle2 />,
      badge:
        counts.billable > 0
          ? { label: String(counts.billable), variant: "success" }
          : undefined,
    },
    {
      key: "NOT_BILLABLE",
      label: "Not billable",
      icon: <XCircle />,
      badge:
        counts.notBillable > 0
          ? { label: String(counts.notBillable), variant: "neutral" }
          : undefined,
    },
    {
      key: "CLAIMED",
      label: "Claimed",
      icon: <Eye />,
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
  ];

  // ─── Handlers ───
  const handleAddNew = () => {
    setSheetMode("create");
    setEditTarget(undefined);
    setSheetOpen(true);
  };

  const handleEdit = (row: AdminVillaRow) => {
    setSheetMode("edit");
    setEditTarget(row);
    setSheetOpen(true);
  };

  const handleToggleBillable = async (row: AdminVillaRow) => {
    const result = await toggleVillaBillableAction(row.id);
    if (result.status === "success") {
      toast.success(result.message ?? "Updated");
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteVillaAction(deleteTarget.id);
    setIsDeleting(false);

    if (result.status === "success") {
      toast.success(result.message ?? "Deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  };

  // ─── Columns ───
  const columns: ProTableColumn<AdminVillaRow>[] = useMemo(
    () => [
      {
        key: "villaNo",
        label: "Villa",
        sortable: true,
        sortAccessor: (r) => r.villaNo,
        width: 100,
        desktop: (r) => (
          <div>
            <div className="font-mono font-medium text-text-primary">
              {r.villaNo}
            </div>
            <div className="text-text-muted text-xs">{r.type}</div>
          </div>
        ),
        mobilePrimary: (r) => `Villa ${r.villaNo}`,
        mobileSecondary: (r) => r.type,
      },
      {
        key: "owner",
        label: "Owner / Resident",
        sortable: true,
        sortAccessor: (r) => r.residentName ?? r.ownerName,
        desktop: (r) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size="sm" name={r.residentName ?? r.ownerName} />
            <div className="min-w-0">
              {r.isClaimed ? (
                <>
                  <div className="font-medium text-text-primary truncate">
                    {r.residentName}
                  </div>
                  <div className="text-text-muted text-xs truncate max-w-50">
                    {r.residentEmail}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-text-secondary truncate">
                    {r.ownerName}
                  </div>
                  <div className="text-warning text-xs">Unclaimed</div>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "area",
        label: "Area",
        align: "right",
        sortable: true,
        sortAccessor: (r) => r.areaInSqFt,
        desktop: (r) => (
          <div className="text-right">
            <div className="font-mono text-text-primary">
              {r.areaInSqFt.toLocaleString("en-IN")}
            </div>
            <div className="text-text-muted text-xs">sqft</div>
          </div>
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
          r.isBillable ? (
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
            <span className="text-text-muted text-body-sm">—</span>
          ),
        hideOn: ["mobile", "tablet"],
      },
      {
        key: "status",
        label: "Status",
        desktop: (r) => (
          <div className="flex flex-col gap-1 items-start">
            {r.isBillable ? (
              <Badge size="sm" variant="success" icon={<CheckCircle2 />}>
                Billable
              </Badge>
            ) : (
              <Badge size="sm" variant="neutral" icon={<XCircle />}>
                Not billable
              </Badge>
            )}
            {r.isClaimed ? (
              <Badge size="sm" variant="info" outline>
                Claimed
              </Badge>
            ) : (
              <Badge size="sm" variant="warning" outline>
                Unclaimed
              </Badge>
            )}
          </div>
        ),
        mobileBadge: (r) =>
          r.isBillable ? (
            <Badge size="sm" variant="success">
              Billable
            </Badge>
          ) : (
            <Badge size="sm" variant="neutral">
              Not billable
            </Badge>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Tabs + Add button row */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <Tabs
            items={tabs}
            value={filter}
            onChange={(v) => setFilter(v as StatusFilter)}
            variant="underline"
            size="md"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus />}
          onClick={handleAddNew}
        >
          Add villa
        </Button>
      </div>

      <ProTable<AdminVillaRow>
        data={filtered}
        columns={columns}
        rowKey="id"
        search
        searchPlaceholder="Search by villa #, owner, resident…"
        searchKeys={["villaNo", "ownerName", "residentName", "residentEmail"]}
        density="comfortable"
        stickyHeader
        maxHeight="70vh"
        emptyTitle={
          filter === "ALL"
            ? "No villas yet"
            : filter === "BILLABLE"
              ? "No billable villas"
              : filter === "NOT_BILLABLE"
                ? "All villas are billable"
                : filter === "CLAIMED"
                  ? "No villas have been claimed yet"
                  : "All villas are claimed"
        }
        emptyDescription={
          filter === "ALL"
            ? "Add the first villa to start tracking maintenance."
            : "Try a different filter."
        }
        actions={(row) => [
          {
            label: "Edit details",
            icon: <Edit />,
            onClick: () => handleEdit(row),
          },
          {
            label: row.isBillable ? "Mark not billable" : "Mark billable",
            icon: row.isBillable ? <EyeOff /> : <Eye />,
            onClick: () => handleToggleBillable(row),
          },
          {
            label: "Delete",
            icon: <Trash2 />,
            variant: "danger",
            onClick: () => setDeleteTarget(row),
          },
        ]}
      />

      {/* Edit/Create sheet */}
      <EditVillaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        villa={editTarget}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title={
          deleteTarget
            ? `Delete Villa ${deleteTarget.villaNo}?`
            : "Delete villa?"
        }
        description={
          deleteTarget
            ? `Villa ${deleteTarget.villaNo} (${deleteTarget.ownerName}) will be permanently removed. This cannot be undone.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-warning-muted border border-warning-border">
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-body-sm text-warning">
                The action will fail if this villa has bills, payments, or is
                linked to a resident.
              </p>
            </div>
            <p className="text-body-sm text-text-secondary">
              For villas under construction or unused, consider marking them as
              <strong className="text-text-primary"> not billable</strong>{" "}
              instead.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
