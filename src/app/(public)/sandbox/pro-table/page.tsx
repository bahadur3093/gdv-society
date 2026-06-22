"use client";

import { useState } from "react";
import {
  CreditCard,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import ProTable, { type ProTableColumn } from "@/components/pro-table/ProTable";
import { formatCurrency } from "@/lib/utils/utils";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { toast } from "@/components/atoms/Toast";

// ─── Sample data ───
interface Villa {
  villaId: string;
  villaNo: number;
  residentName: string | null;
  residentEmail: string | null;
  ownerName: string;
  areaInSqFt: number;
  monthlyDue: number;
  outstandingBalance: number;
  lastPaymentDate: Date | null;
  status: "PAID" | "PARTIAL" | "PENDING" | "NOT_BILLABLE";
  isClaimed: boolean;
}

const SAMPLE_DATA: Villa[] = [
  {
    villaId: "1",
    villaNo: 39,
    residentName: "Bahadur Singh",
    residentEmail: "bahadur@gdv.com",
    ownerName: "Bahadur Singh",
    areaInSqFt: 1200,
    monthlyDue: 3600,
    outstandingBalance: 6320,
    lastPaymentDate: new Date("2026-05-15"),
    status: "PARTIAL",
    isClaimed: true,
  },
  {
    villaId: "2",
    villaNo: 12,
    residentName: null,
    residentEmail: null,
    ownerName: "Priya Sharma",
    areaInSqFt: 1500,
    monthlyDue: 4500,
    outstandingBalance: 9000,
    lastPaymentDate: null,
    status: "PENDING",
    isClaimed: false,
  },
  {
    villaId: "3",
    villaNo: 5,
    residentName: "Ramesh Kumar",
    residentEmail: "ramesh@gdv.com",
    ownerName: "Ramesh Kumar",
    areaInSqFt: 1000,
    monthlyDue: 3000,
    outstandingBalance: 0,
    lastPaymentDate: new Date("2026-06-01"),
    status: "PAID",
    isClaimed: true,
  },
  {
    villaId: "4",
    villaNo: 23,
    residentName: null,
    residentEmail: null,
    ownerName: "Anita Verma",
    areaInSqFt: 1800,
    monthlyDue: 5400,
    outstandingBalance: 10800,
    lastPaymentDate: null,
    status: "PENDING",
    isClaimed: false,
  },
  {
    villaId: "5",
    villaNo: 7,
    residentName: "Sanjay Patel",
    residentEmail: "sanjay@gdv.com",
    ownerName: "Sanjay Patel",
    areaInSqFt: 2000,
    monthlyDue: 6000,
    outstandingBalance: 2400,
    lastPaymentDate: new Date("2026-05-20"),
    status: "PARTIAL",
    isClaimed: true,
  },
  {
    villaId: "6",
    villaNo: 31,
    residentName: null,
    residentEmail: null,
    ownerName: "Vikram Reddy",
    areaInSqFt: 1200,
    monthlyDue: 3600,
    outstandingBalance: 0,
    lastPaymentDate: new Date("2026-06-08"),
    status: "PAID",
    isClaimed: false,
  },
  {
    villaId: "7",
    villaNo: 18,
    residentName: "Meera Iyer",
    residentEmail: "meera@gdv.com",
    ownerName: "Meera Iyer",
    areaInSqFt: 1500,
    monthlyDue: 4500,
    outstandingBalance: 4500,
    lastPaymentDate: new Date("2026-05-01"),
    status: "PENDING",
    isClaimed: true,
  },
  {
    villaId: "8",
    villaNo: 42,
    residentName: null,
    residentEmail: null,
    ownerName: "Plot Owner 42",
    areaInSqFt: 0,
    monthlyDue: 0,
    outstandingBalance: 0,
    lastPaymentDate: null,
    status: "NOT_BILLABLE",
    isClaimed: false,
  },
  {
    villaId: "9",
    villaNo: 15,
    residentName: null,
    residentEmail: null,
    ownerName: "Owner 15",
    areaInSqFt: 1000,
    monthlyDue: 3000,
    outstandingBalance: 3000,
    lastPaymentDate: null,
    status: "PENDING",
    isClaimed: false,
  },
  {
    villaId: "10",
    villaNo: 28,
    residentName: "Arjun Mehta",
    residentEmail: "arjun@gdv.com",
    ownerName: "Arjun Mehta",
    areaInSqFt: 1800,
    monthlyDue: 5400,
    outstandingBalance: 0,
    lastPaymentDate: new Date("2026-06-10"),
    status: "PAID",
    isClaimed: true,
  },
];

// ─── Column definitions ───
// Update the existing `columns` definition in your sandbox
// Add mobile renderers to each column:

const columns: ProTableColumn<Villa>[] = [
  {
    key: "villaNo",
    label: "Villa",
    sortable: true,
    width: 80,
    sortAccessor: (r) => r.villaNo,
    desktop: (r) => (
      <div>
        <div className="font-mono font-medium">{r.villaNo}</div>
        <div className="text-text-muted text-xs">{r.areaInSqFt} sqft</div>
      </div>
    ),
    // 🆕 Mobile: villa number is primary
    mobilePrimary: (r) => `Villa ${r.villaNo}`,
    mobileSecondary: (r) => `${r.areaInSqFt} sqft`,
  },
  {
    key: "resident",
    label: "Resident / Owner",
    sortable: true,
    sortAccessor: (r) => r.residentName ?? r.ownerName,
    desktop: (r) =>
      r.isClaimed ? (
        <div>
          <div className="text-text-primary">{r.residentName}</div>
          <div className="text-text-muted text-xs">{r.residentEmail}</div>
        </div>
      ) : (
        <div>
          <div className="text-text-secondary">{r.ownerName}</div>
          <div className="text-warning text-xs">Unclaimed</div>
        </div>
      ),
    // 🆕 On mobile, show resident name in primary slot (overrides villa)
    // Skip mobilePrimary to keep Villa as primary
    mobileSecondary: (r) =>
      r.isClaimed ? r.residentName : `${r.ownerName} (Unclaimed)`,
  },
  {
    key: "monthlyDue",
    label: "Monthly",
    align: "right",
    sortable: true,
    sortAccessor: (r) => r.monthlyDue,
    desktop: (r) => (
      <span className="font-mono text-text-secondary">
        {formatCurrency(r.monthlyDue)}
      </span>
    ),
    // Don't expose on mobile (saved for sheet)
  },
  {
    key: "outstanding",
    label: "Outstanding",
    align: "right",
    sortable: true,
    sortAccessor: (r) => r.outstandingBalance,
    desktop: (r) => (
      <span
        className={`font-mono font-medium ${
          r.outstandingBalance > 0 ? "text-danger" : "text-text-primary"
        }`}
      >
        {formatCurrency(r.outstandingBalance)}
      </span>
    ),
    // 🆕 This is the headline number on mobile
    mobileAccent: (r) => (
      <span
        className={`font-mono ${
          r.outstandingBalance > 0 ? "text-danger" : "text-success"
        }`}
      >
        {formatCurrency(r.outstandingBalance)}
      </span>
    ),
  },
  {
    key: "lastPayment",
    label: "Last Payment",
    sortable: true,
    sortAccessor: (r) => r.lastPaymentDate?.getTime() ?? 0,
    desktop: (r) =>
      r.lastPaymentDate ? (
        <span className="text-text-secondary">
          {r.lastPaymentDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </span>
      ) : (
        <span className="text-text-muted">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortAccessor: (r) => r.status,
    desktop: (r) => {
      const config = {
        PAID: {
          label: "Paid",
          variant: "success" as const,
          icon: <CheckCircle2 />,
        },
        PARTIAL: {
          label: "Partial",
          variant: "warning" as const,
          icon: <Clock />,
        },
        PENDING: {
          label: "Pending",
          variant: "danger" as const,
          icon: <AlertCircle />,
        },
        NOT_BILLABLE: { label: "Not billable", variant: "neutral" as const },
      }[r.status];
      return (
        <Badge size="sm" variant={config.variant} icon={config.icon}>
          {config.label}
        </Badge>
      );
    },
    // 🆕 Same badge on mobile
    mobileBadge: (r) => {
      const config = {
        PAID: { label: "Paid", variant: "success" as const },
        PARTIAL: { label: "Partial", variant: "warning" as const },
        PENDING: { label: "Pending", variant: "danger" as const },
        NOT_BILLABLE: { label: "Not billable", variant: "neutral" as const },
      }[r.status];
      return (
        <Badge size="sm" variant={config.variant}>
          {config.label}
        </Badge>
      );
    },
  },
];

// ─── The sandbox page ───
export default function ProTableSandbox() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-h1 text-text-primary">Pro Table</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          The big custom component. Step 22a: foundation + working desktop mode.
        </p>
      </header>

      <Card padding="md" variant="sunken">
        <p className="text-body text-text-primary mb-2">💡 Try these:</p>
        <ul className="text-body-sm text-text-secondary space-y-1 ml-4">
          <li>• Click any sortable column header — sort asc / desc / clear</li>
          <li>• Type in search — instant filtering</li>
          <li>• Click row action icons — toasts appear</li>
          <li>• Toggle loading to see skeleton rows</li>
          <li>• Clear the search after filtering to see all 10 rows again</li>
        </ul>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setLoading((l) => !l)}>
          Toggle loading: {loading ? "ON" : "OFF"}
        </Button>
        <Button
          variant="ghost"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          Simulate fetch
        </Button>
      </div>

      <ProTable<Villa>
        data={SAMPLE_DATA}
        columns={columns}
        rowKey="villaId"
        loading={loading}
        search
        searchPlaceholder="Search by villa, resident, owner..."
        searchKeys={["villaNo", "residentName", "ownerName", "residentEmail"]}
        defaultSort={{ key: "outstanding", direction: "desc" }}
        density="comfortable"
        actions={(row) => [
          {
            label: "Record Payment",
            icon: <CreditCard />,
            show: (r) => r.outstandingBalance > 0,
            onClick: (r) => toast.info(`Record payment for Villa ${r.villaNo}`),
          },
          {
            label: "View Ledger",
            icon: <Eye />,
            show: (r) => r.isClaimed,
            onClick: (r) => toast.info(`View ledger for ${r.residentName}`),
          },
          {
            label: "Edit",
            icon: <Edit />,
            onClick: (r) => toast.info(`Edit Villa ${r.villaNo}`),
          },
        ]}
        emptyTitle="No villas match your search"
        emptyDescription="Try a different search term or clear the search"
      />

      {/* Compact density variant */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">Compact density</h2>
        <ProTable<Villa>
          data={SAMPLE_DATA.slice(0, 5)}
          columns={columns}
          rowKey="villaId"
          density="compact"
        />
      </section>

      {/* Empty state */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">Empty state</h2>
        <ProTable<Villa>
          data={[]}
          columns={columns}
          rowKey="villaId"
          emptyTitle="No villas yet"
          emptyDescription="Add your first villa to get started"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">
          With title + toolbar actions
        </h2>
        <ProTable<Villa>
          data={SAMPLE_DATA}
          columns={columns}
          rowKey="villaId"
          title="Master Ledger"
          description="47 villas total • Generate bills for the upcoming month"
          search
          searchPlaceholder="Search villas..."
          searchKeys={["villaNo", "residentName", "ownerName"]}
          showDensityToggle
          toolbarActions={
            <>
              <Button variant="secondary" size="sm">
                Export CSV
              </Button>
              <Button size="sm">Generate Bills</Button>
            </>
          }
          actions={(row) => [
            {
              label: "View",
              icon: <Eye />,
              onClick: (r) => toast.info(`View ${r.villaNo}`),
            },
          ]}
        />
      </section>

      {/* ─── Sticky Header (with max height) ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">Sticky header</h2>
        <p className="text-body-sm text-text-secondary">
          Scroll inside the table — header stays visible
        </p>
        <ProTable<Villa>
          data={[...SAMPLE_DATA, ...SAMPLE_DATA, ...SAMPLE_DATA]} // 30 rows
          columns={columns}
          rowKey={(r, i) => `${r.villaId}-${SAMPLE_DATA.indexOf(r)}`}
          stickyHeader
          maxHeight={400}
          density="compact"
        />
      </section>

      {/* ─── Sticky Actions Column ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">Sticky actions column</h2>
        <p className="text-body-sm text-text-secondary">
          On narrow viewports, scroll horizontally — actions stay pinned to the
          right
        </p>
        <ProTable<Villa>
          data={SAMPLE_DATA}
          columns={columns}
          rowKey="villaId"
          stickyActions
          actions={(row) => [
            {
              label: "Record Payment",
              icon: <CreditCard />,
              show: (r) => r.outstandingBalance > 0,
              onClick: (r) => toast.info(`Payment for Villa ${r.villaNo}`),
            },
            {
              label: "View",
              icon: <Eye />,
              onClick: (r) => toast.info(`View Villa ${r.villaNo}`),
            },
            {
              label: "Edit",
              icon: <Edit />,
              onClick: (r) => toast.info(`Edit Villa ${r.villaNo}`),
            },
          ]}
        />
      </section>

      {/* ─── Both sticky + density toggle (the works) ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">
          The works — sticky everything
        </h2>
        <ProTable<Villa>
          data={[...SAMPLE_DATA, ...SAMPLE_DATA]} // 20 rows
          columns={columns}
          rowKey={(r, i) => `combo-${r.villaId}-${i}`}
          title="Production-ready Table"
          description="Sticky header + sticky actions + density toggle"
          search
          searchKeys={["villaNo", "residentName", "ownerName"]}
          showDensityToggle
          stickyHeader
          stickyActions
          maxHeight={500}
          actions={(row) => [
            {
              label: "Record Payment",
              icon: <CreditCard />,
              show: (r) => r.outstandingBalance > 0,
              onClick: (r) => toast.info(`Payment for Villa ${r.villaNo}`),
            },
            { label: "View Ledger", icon: <Eye />, show: (r) => r.isClaimed },
            { label: "Edit", icon: <Edit /> },
          ]}
        />
      </section>

      {/* ─── Borderless variant ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">
          Borderless (no row dividers)
        </h2>
        <ProTable<Villa>
          data={SAMPLE_DATA.slice(0, 5)}
          columns={columns}
          rowKey="villaId"
          rowDividers={false}
        />
      </section>

      {/* ─── Auto-responsive demo ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">
          Auto-responsive (resize browser!)
        </h2>
        <p className="text-body-sm text-text-secondary">
          Resize your browser window or use mobile DevTools view. Same data,
          three different layouts.
        </p>
        <ProTable<Villa>
          data={SAMPLE_DATA}
          columns={columns}
          rowKey="villaId"
          title="Villa Overview"
          description="Tap any row on mobile to see all details"
          search
          searchKeys={["villaNo", "residentName", "ownerName"]}
          actions={(row) => [
            {
              label: "Record Payment",
              icon: <CreditCard />,
              show: (r) => r.outstandingBalance > 0,
              onClick: (r) => toast.info(`Payment for Villa ${r.villaNo}`),
            },
            {
              label: "View Ledger",
              icon: <Eye />,
              show: (r) => r.isClaimed,
              onClick: (r) => toast.info(`Ledger for Villa ${r.villaNo}`),
            },
            {
              label: "Edit",
              icon: <Edit />,
              onClick: (r) => toast.info(`Edit Villa ${r.villaNo}`),
            },
          ]}
        />
      </section>

      {/* ─── Mobile in list mode ─── */}
      <section className="space-y-3">
        <h2 className="text-h3 text-text-primary">
          Mobile in list mode (vs cards)
        </h2>
        <p className="text-body-sm text-text-secondary">
          Use mobileMode=&quot;list&quot; for denser mobile lists
        </p>
        <ProTable<Villa>
          data={SAMPLE_DATA}
          columns={columns}
          rowKey="villaId"
          mobileMode="list"
          actions={(row) => [
            {
              label: "View",
              icon: <Eye />,
              onClick: (r) => toast.info(`View ${r.villaNo}`),
            },
          ]}
        />
      </section>
    </div>
  );
}
