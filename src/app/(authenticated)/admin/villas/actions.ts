"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface VillaActionState {
  status: "idle" | "success" | "error";
  message?: string;
  id?: string;
  errors?: {
    villaNo?: string;
    type?: string;
    ownerName?: string;
    areaInSqFt?: string;
    remarks?: string;
  };
}

// Valid villa types (matches dropdown options in UI)
const VALID_TYPES = ["Standard", "Corner", "Premium", "Custom"] as const;

// ─────────────────────────────────────────────────────────────
//  Shared validation
// ─────────────────────────────────────────────────────────────

interface ParsedVillaData {
  villaNo?: number;
  type: string;
  ownerName: string;
  areaInSqFt: number;
  areaInSqM: number;
  remarks: string | null;
  isBillable: boolean;
  errors?: VillaActionState["errors"];
}

function parseFormData(
  formData: FormData,
  options: { requireVillaNo?: boolean } = {},
): ParsedVillaData {
  const errors: NonNullable<VillaActionState["errors"]> = {};

  const villaNoRaw = formData.get("villaNo") as string;
  const villaNo =
    villaNoRaw && villaNoRaw.trim() !== ""
      ? parseInt(villaNoRaw, 10)
      : undefined;

  if (options.requireVillaNo) {
    if (villaNo === undefined || isNaN(villaNo)) {
      errors.villaNo = "Villa number is required";
    } else if (villaNo < 1 || villaNo > 9999) {
      errors.villaNo = "Villa number must be between 1 and 9999";
    }
  }

  const type = (formData.get("type") as string)?.trim() ?? "";
  if (!type) errors.type = "Type is required";
  else if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    errors.type = "Invalid type";
  }

  const ownerName = (formData.get("ownerName") as string)?.trim() ?? "";
  if (!ownerName) errors.ownerName = "Owner name is required";
  else if (ownerName.length > 100) {
    errors.ownerName = "Owner name must be 100 characters or less";
  }

  const areaInSqFtRaw = formData.get("areaInSqFt") as string;
  const areaInSqFt = parseFloat(areaInSqFtRaw);
  if (isNaN(areaInSqFt) || areaInSqFt <= 0) {
    errors.areaInSqFt = "Area must be a positive number";
  } else if (areaInSqFt > 100000) {
    errors.areaInSqFt = "Area seems too large — check the value";
  }

  // Auto-derive sqm from sqft (1 sqft = 0.092903 sqm)
  const areaInSqM = !isNaN(areaInSqFt)
    ? +(areaInSqFt * 0.092903).toFixed(2)
    : 0;

  const remarks = (formData.get("remarks") as string)?.trim() || null;
  if (remarks && remarks.length > 500) {
    errors.remarks = "Remarks too long (max 500 characters)";
  }

  const isBillable = formData.get("isBillable") === "true";

  return {
    villaNo,
    type,
    ownerName,
    areaInSqFt,
    areaInSqM,
    remarks,
    isBillable,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────
//  Create villa
// ─────────────────────────────────────────────────────────────

export async function createVillaAction(
  _prev: VillaActionState,
  formData: FormData,
): Promise<VillaActionState> {
  try {
    await requireAdmin();

    const data = parseFormData(formData, { requireVillaNo: true });
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    // Check uniqueness of villaNo
    const existing = await prisma.villa.findUnique({
      where: { villaNo: data.villaNo! },
      select: { id: true },
    });
    if (existing) {
      return {
        status: "error",
        message: `Villa ${data.villaNo} already exists`,
        errors: { villaNo: `Villa ${data.villaNo} already exists` },
      };
    }

    const created = await prisma.villa.create({
      data: {
        villaNo: data.villaNo!,
        type: data.type,
        ownerName: data.ownerName,
        areaInSqFt: data.areaInSqFt,
        areaInSqM: data.areaInSqM,
        remarks: data.remarks,
        isBillable: data.isBillable,
      },
    });

    revalidatePath("/admin/villas");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");

    return {
      status: "success",
      message: `Villa ${data.villaNo} created`,
      id: created.id,
    };
  } catch (e) {
    console.error("[createVillaAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to create villa",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Edit villa
// ─────────────────────────────────────────────────────────────

export async function editVillaAction(
  _prev: VillaActionState,
  formData: FormData,
): Promise<VillaActionState> {
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) {
      return { status: "error", message: "Missing villa ID" };
    }

    // We don't allow villaNo edits (immutable). Skip validation for it.
    const data = parseFormData(formData, { requireVillaNo: false });
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    const existing = await prisma.villa.findUnique({
      where: { id },
      select: { id: true, villaNo: true },
    });
    if (!existing) {
      return { status: "error", message: "Villa not found" };
    }

    await prisma.villa.update({
      where: { id },
      data: {
        type: data.type,
        ownerName: data.ownerName,
        areaInSqFt: data.areaInSqFt,
        areaInSqM: data.areaInSqM,
        remarks: data.remarks,
        isBillable: data.isBillable,
      },
    });

    revalidatePath("/admin/villas");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");
    revalidatePath("/admin/residents");

    return {
      status: "success",
      message: `Villa ${existing.villaNo} updated`,
      id,
    };
  } catch (e) {
    console.error("[editVillaAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update villa",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Toggle billable
// ─────────────────────────────────────────────────────────────

export async function toggleVillaBillableAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.villa.findUnique({
      where: { id },
      select: { id: true, villaNo: true, isBillable: true },
    });
    if (!existing) {
      return { status: "error", message: "Villa not found" };
    }

    await prisma.villa.update({
      where: { id },
      data: { isBillable: !existing.isBillable },
    });

    revalidatePath("/admin/villas");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");

    return {
      status: "success",
      message: `Villa ${existing.villaNo} marked as ${
        existing.isBillable ? "not billable" : "billable"
      }`,
    };
  } catch (e) {
    console.error("[toggleVillaBillableAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to toggle billable",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Delete villa
// ─────────────────────────────────────────────────────────────

export async function deleteVillaAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.villa.findUnique({
      where: { id },
      select: {
        id: true,
        villaNo: true,
        userId: true,
        _count: {
          select: {
            maintenanceBills: true,
            payments: true,
            paymentRequests: true,
          },
        },
      },
    });

    if (!existing) {
      return { status: "error", message: "Villa not found" };
    }

    // Safety: prevent deleting villa with active data
    if (existing.userId) {
      return {
        status: "error",
        message: `Villa ${existing.villaNo} is linked to a resident. Unlink first via Residents Directory.`,
      };
    }
    if (existing._count.maintenanceBills > 0) {
      return {
        status: "error",
        message: `Villa ${existing.villaNo} has ${existing._count.maintenanceBills} bills. Mark as not billable instead of deleting.`,
      };
    }
    if (existing._count.payments > 0) {
      return {
        status: "error",
        message: `Villa ${existing.villaNo} has payment records. Cannot delete.`,
      };
    }
    if (existing._count.paymentRequests > 0) {
      return {
        status: "error",
        message: `Villa ${existing.villaNo} has payment requests. Cannot delete.`,
      };
    }

    await prisma.villa.delete({ where: { id } });

    revalidatePath("/admin/villas");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");

    return {
      status: "success",
      message: `Villa ${existing.villaNo} deleted`,
    };
  } catch (e) {
    console.error("[deleteVillaAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to delete villa",
    };
  }
}
