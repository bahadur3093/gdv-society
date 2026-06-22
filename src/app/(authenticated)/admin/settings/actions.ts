"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/auth";

export interface SaveSettingsState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function saveSocietySettingsAction(
  _prevState: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  try {
    await requireAdmin();

    const perSqFtRate = parseFloat(formData.get("perSqFtRate") as string);
    const sinkingFundPercentage = parseFloat(
      formData.get("sinkingFundPercentage") as string,
    );
    const totalVillas = parseInt(formData.get("totalVillas") as string, 10);

    // Validation
    if (isNaN(perSqFtRate) || perSqFtRate < 0) {
      return {
        status: "error",
        message: "Per sq.ft rate must be a positive number",
      };
    }
    if (
      isNaN(sinkingFundPercentage) ||
      sinkingFundPercentage < 0 ||
      sinkingFundPercentage > 100
    ) {
      return {
        status: "error",
        message: "Sinking fund must be between 0 and 100",
      };
    }
    if (isNaN(totalVillas) || totalVillas < 1) {
      return { status: "error", message: "Total villas must be at least 1" };
    }

    // Upsert the single settings row
    const existing = await prisma.societySettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await prisma.societySettings.update({
        where: { id: existing.id },
        data: {
          perSqFtRate,
          sinkingFundPercentage,
          totalVillas,
        },
      });
    } else {
      await prisma.societySettings.create({
        data: {
          perSqFtRate,
          sinkingFundPercentage,
          totalVillas,
        },
      });
    }

    // Revalidate everywhere settings impact
    revalidatePath("/admin/settings");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");
    revalidatePath("/resident/ledger");
    revalidatePath("/resident");

    return { status: "success", message: "Settings saved successfully" };
  } catch (e) {
    console.error("[saveSocietySettingsAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to save settings",
    };
  }
}
