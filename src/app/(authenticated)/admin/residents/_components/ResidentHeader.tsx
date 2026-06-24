"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  KeyRound,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  UserX,
  UserCheck,
} from "lucide-react";
import { approveResidentAction, reactivateResidentAction, resetResidentPasswordAction, suspendResidentAction } from "../actions";
import type { AdminResidentDetail } from "@/lib/users/getAdminResidents";
import { toast } from "@/components/atoms/Toast";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import Badge from "@/components/atoms/Badge";
import { cn, formatDate } from "@/lib/utils/utils";
import EditResidentSheet from "./EditResidentSheet";

interface Props {
  resident: AdminResidentDetail;
  availableVillas: Array<{
    id: string;
    villaNo: number;
    ownerName: string;
  }>;
}

export default function ResidentHeader({ resident, availableVillas }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isApproving, startApproveTransition] = useTransition();
  const [isSuspending, startSuspendTransition] = useTransition();

  const handleResetPassword = async () => {
    setIsResetting(true);
    const result = await resetResidentPasswordAction(resident.id);
    setIsResetting(false);

    if (result.status === "success") {
      toast.success("Password reset link generated", {
        description: result.message,
      });
      setResetOpen(false);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to generate reset link");
    }
  };

  const handleApprove = () => {
    startApproveTransition(async () => {
      const result = await approveResidentAction(resident.id);
      if (result.status === "success") {
        toast.success(result.message ?? "Approved");
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to approve");
      }
    });
  };

  const handleSuspend = () => {
    startSuspendTransition(async () => {
      const result = await suspendResidentAction(resident.id);
      if (result.status === "success") {
        toast.success(result.message ?? "Suspended");
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to suspend");
      }
    });
  };

  const handleReactivate = () => {
    startSuspendTransition(async () => {
      const result = await reactivateResidentAction(resident.id);
      if (result.status === "success") {
        toast.success(result.message ?? "Reactivated");
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to reactivate");
      }
    });
  };

  return (
    <>
      <Card
        padding="lg"
        variant="gradient"
        className="relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar + name block */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar
              size="xl"
              name={resident.name}
              ring={resident.emailVerified ? "success" : "subtle"}
            />
            <div className="flex-1 min-w-0">
              {/* Name + verification */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h2 text-text-primary truncate">
                  {resident.name}
                </h1>
                {resident.emailVerified ? (
                  <span title="Email verified">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  </span>
                ) : (
                  <span title="Email not verified">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  </span>
                )}
              </div>

              {/* Email */}
              <p className="text-body text-text-secondary mt-1 truncate">
                {resident.email}
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {resident.accountStatus === "PENDING" && (
                  <Badge variant="warning">Pending approval</Badge>
                )}
                {resident.accountStatus === "SUSPENDED" && (
                  <Badge variant="danger">Suspended</Badge>
                )}

                {resident.villa ? (
                  <Badge variant="success" icon={<CheckCircle2 />}>
                    Villa {resident.villa.villaNo}
                  </Badge>
                ) : (
                  <Badge variant="warning" icon={<AlertTriangle />}>
                    No villa linked
                  </Badge>
                )}

                {!resident.emailVerified && (
                  <Badge variant="danger">Email unverified</Badge>
                )}

                {resident.pendingRequestsCount > 0 && (
                  <Badge variant="info">
                    {resident.pendingRequestsCount} pending request
                    {resident.pendingRequestsCount === 1 ? "" : "s"}
                  </Badge>
                )}

                {resident.pendingPaymentRequestsCount > 0 && (
                  <Badge variant="warning">
                    {resident.pendingPaymentRequestsCount} payment review
                    {resident.pendingPaymentRequestsCount === 1 ? "" : "s"}
                  </Badge>
                )}

                {resident.accountStatus === "PENDING" && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleApprove}
                    disabled={isApproving}
                  >
                    {isApproving ? "Approving…" : "Approve account"}
                  </Button>
                )}

                {resident.accountStatus === "APPROVED" && (
                  <Button
                    variant="ghost"
                    size="md"
                    icon={<UserX className="w-4 h-4" />}
                    onClick={handleSuspend}
                    disabled={isSuspending}
                  >
                    {isSuspending ? "Suspending…" : "Suspend"}
                  </Button>
                )}

                {resident.accountStatus === "SUSPENDED" && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={<UserCheck className="w-4 h-4" />}
                    onClick={handleReactivate}
                    disabled={isSuspending}
                  >
                    {isSuspending ? "Reactivating…" : "Reactivate"}
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center gap-1.5 mt-4",
                  "text-body-sm text-text-muted",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(resident.createdAt, "long")}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>

            {resident.villa && (
              <Button
                asChild
                variant="secondary"
                size="md"
                icon={<BookOpen className="w-4 h-4" />}
              >
                <Link href={`/admin/ledger/${resident.id}`}>Ledger</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="md"
              icon={<KeyRound className="w-4 h-4" />}
              onClick={() => setResetOpen(true)}
            >
              Reset password
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit modal/sheet (Step 36d builds this) */}
      <EditResidentSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        resident={resident}
        availableVillas={availableVillas}
      />

      {/* Reset password confirmation */}
      <Modal
        open={resetOpen}
        onOpenChange={(open) => !open && !isResetting && setResetOpen(false)}
        title="Reset password?"
        description={`Generate a reset link for ${resident.name}. They can use it within 24 hours.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setResetOpen(false)}
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
    </>
  );
}
