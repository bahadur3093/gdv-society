"use server";

import { revalidatePath } from "next/cache";
import { requireResident } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface EditProfileState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    name?: string;
    plotNumber?: string;
  };
}

export interface FamilyMemberState {
  status: "idle" | "success" | "error";
  message?: string;
  id?: string;
  errors?: {
    name?: string;
    relationship?: string;
    contact?: string;
  };
}

export interface PasswordResetState {
  status: "idle" | "success" | "error";
  message?: string;
}

// ─────────────────────────────────────────────────────────────
//  Valid relationship options (match UI)
// ─────────────────────────────────────────────────────────────

const VALID_RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "In-Law",
  "Other",
] as const;

// ─────────────────────────────────────────────────────────────
//  Edit profile (name + plot number)
// ─────────────────────────────────────────────────────────────

export async function editProfileAction(
  _prev: EditProfileState,
  formData: FormData,
): Promise<EditProfileState> {
  try {
    const user = await requireResident();

    const name = (formData.get("name") as string)?.trim() ?? "";
    const plotNumber = (formData.get("plotNumber") as string)?.trim() || null;

    const errors: NonNullable<EditProfileState["errors"]> = {};

    if (!name) errors.name = "Name is required";
    else if (name.length > 100)
      errors.name = "Name must be 100 characters or less";
    else if (name.length < 2)
      errors.name = "Name must be at least 2 characters";

    if (plotNumber && plotNumber.length > 50) {
      errors.plotNumber = "Plot number too long";
    }

    if (Object.keys(errors).length > 0) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors,
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, plotNumber },
    });

    revalidatePath("/resident/profile");
    revalidatePath("/resident");
    revalidatePath("/admin/residents");

    return {
      status: "success",
      message: "Profile updated",
    };
  } catch (e) {
    console.error("[editProfileAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update profile",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Family member validation
// ─────────────────────────────────────────────────────────────

function validateFamilyMember(formData: FormData): {
  name: string;
  relationship: string;
  contact: string;
  errors?: FamilyMemberState["errors"];
} {
  const errors: NonNullable<FamilyMemberState["errors"]> = {};

  const name = (formData.get("name") as string)?.trim() ?? "";
  const relationship = (formData.get("relationship") as string)?.trim() ?? "";
  const contact = (formData.get("contact") as string)?.trim() ?? "";

  if (!name) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "Name too long";

  if (!relationship) errors.relationship = "Relationship is required";
  else if (
    !VALID_RELATIONSHIPS.includes(
      relationship as (typeof VALID_RELATIONSHIPS)[number],
    )
  ) {
    errors.relationship = "Invalid relationship";
  }

  if (!contact) errors.contact = "Contact is required";
  else if (contact.length > 50) errors.contact = "Contact too long";

  return {
    name,
    relationship,
    contact,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────
//  Add family member
// ─────────────────────────────────────────────────────────────

export async function addFamilyMemberAction(
  _prev: FamilyMemberState,
  formData: FormData,
): Promise<FamilyMemberState> {
  try {
    const user = await requireResident();

    const data = validateFamilyMember(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    // Optional: check member limit (e.g., max 10)
    const count = await prisma.familyMember.count({
      where: { userId: user.id },
    });
    if (count >= 20) {
      return {
        status: "error",
        message:
          "Maximum 20 family members allowed. Contact admin if you need more.",
      };
    }

    const created = await prisma.familyMember.create({
      data: {
        userId: user.id,
        name: data.name,
        relationship: data.relationship,
        contact: data.contact,
      },
    });

    revalidatePath("/resident/profile");
    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${user.id}`);

    return {
      status: "success",
      message: "Family member added",
      id: created.id,
    };
  } catch (e) {
    console.error("[addFamilyMemberAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to add member",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Edit family member
// ─────────────────────────────────────────────────────────────

export async function editFamilyMemberAction(
  _prev: FamilyMemberState,
  formData: FormData,
): Promise<FamilyMemberState> {
  try {
    const user = await requireResident();

    const memberId = formData.get("memberId") as string;
    if (!memberId) {
      return { status: "error", message: "Missing member ID" };
    }

    const data = validateFamilyMember(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    // Verify ownership
    const existing = await prisma.familyMember.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return { status: "error", message: "Family member not found" };
    }

    if (existing.userId !== user.id) {
      return { status: "error", message: "Not authorized to edit this member" };
    }

    await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        name: data.name,
        relationship: data.relationship,
        contact: data.contact,
      },
    });

    revalidatePath("/resident/profile");
    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${user.id}`);

    return {
      status: "success",
      message: "Family member updated",
      id: memberId,
    };
  } catch (e) {
    console.error("[editFamilyMemberAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update member",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Delete family member
// ─────────────────────────────────────────────────────────────

export async function deleteFamilyMemberAction(
  memberId: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    const user = await requireResident();

    const existing = await prisma.familyMember.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true, name: true },
    });

    if (!existing) {
      return { status: "error", message: "Family member not found" };
    }

    if (existing.userId !== user.id) {
      return {
        status: "error",
        message: "Not authorized to delete this member",
      };
    }

    await prisma.familyMember.delete({ where: { id: memberId } });

    revalidatePath("/resident/profile");
    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${user.id}`);

    return {
      status: "success",
      message: `${existing.name} removed from family list`,
    };
  } catch (e) {
    console.error("[deleteFamilyMemberAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to delete member",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Request password reset (resident self-service)
// ─────────────────────────────────────────────────────────────

export async function requestPasswordResetAction(): Promise<PasswordResetState> {
  try {
    const user = await requireResident();

    // Cancel any existing pending resets
    await prisma.passwordResetRequest.updateMany({
      where: { userId: user.id, status: "PENDING" },
      data: { status: "EXPIRED" },
    });

    // Create new pending request (admin will approve)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        status: "PENDING",
        requestedAt: new Date(),
        expiresAt,
      },
    });

    revalidatePath("/resident/profile");

    return {
      status: "success",
      message:
        "Password reset requested. Admin will review and email you a reset link.",
    };
  } catch (e) {
    console.error("[requestPasswordResetAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to request reset",
    };
  }
}
