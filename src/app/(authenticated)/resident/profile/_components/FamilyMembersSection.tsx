"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, Phone } from "lucide-react";
import { deleteFamilyMemberAction } from "../actions";
import type { ResidentProfileData } from "@/lib/users/getResidentProfile";
import { toast } from "@/components/atoms/Toast";
import Section from "@/components/organisms/Section";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import IconButton from "@/components/atoms/IconButton";
import Modal from "@/components/molecules/Modal";
import EmptyState from "@/components/organisms/EmptyState";
import FamilyMemberSheet from "./FamilyMemberSheet";

type FamilyMember = ResidentProfileData["familyMembers"][number];

interface Props {
  members: FamilyMember[];
}

export default function FamilyMembersSection({ members }: Props) {
  const router = useRouter();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<FamilyMember | undefined>(
    undefined,
  );

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Handlers ───
  const handleAddNew = () => {
    setSheetMode("add");
    setEditTarget(undefined);
    setSheetOpen(true);
  };

  const handleEdit = (member: FamilyMember) => {
    setSheetMode("edit");
    setEditTarget(member);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteFamilyMemberAction(deleteTarget.id);
    setIsDeleting(false);

    if (result.status === "success") {
      toast.success(result.message ?? "Member removed");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  };

  return (
    <>
      <Section
        title="Family Members"
        description={
          members.length > 0
            ? `${members.length} registered`
            : "Add your family members for the society records"
        }
        icon={<Users />}
        badge={
          members.length > 0
            ? { label: String(members.length), variant: "neutral" }
            : undefined
        }
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus />}
            onClick={handleAddNew}
          >
            Add member
          </Button>
        }
      >
        {members.length === 0 ? (
          <Card padding="md">
            <EmptyState
              size="sm"
              icon={<Users />}
              title="No family members yet"
              description="Add your spouse, children, or other family members to keep society records up to date."
              action={{
                label: "Add first member",
                onClick: handleAddNew,
              }}
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
                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                      label="Edit member"
                      icon={<Edit />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(m)}
                    />
                    <IconButton
                      label="Remove member"
                      icon={<Trash2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(m)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      {/* Add/Edit sheet */}
      <FamilyMemberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        member={editTarget}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title={deleteTarget ? `Remove ${deleteTarget.name}?` : "Remove member?"}
        description={
          deleteTarget
            ? `${deleteTarget.name} will be removed from your family list. You can add them back anytime.`
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
              {isDeleting ? "Removing…" : "Remove member"}
            </Button>
          </>
        }
      />
    </>
  );
}
