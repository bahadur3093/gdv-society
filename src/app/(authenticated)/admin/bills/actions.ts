"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import {
  GenerateBillsResult,
  generateMonthlyBills,
} from "@/lib/billing/generateMonthlyBills";

export interface GenerateBillsActionState {
  status: "idle" | "success" | "error";
  message?: string;
  result?: GenerateBillsResult;
}

export async function generateBillsAction(
  _prevState: GenerateBillsActionState,
  formData: FormData,
): Promise<GenerateBillsActionState> {
  try {
    await requireAdmin();

    const month = parseInt(formData.get("month") as string, 10);
    const year = parseInt(formData.get("year") as string, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return { status: "error", message: "Invalid month" };
    }
    if (isNaN(year) || year < 2020 || year > 2100) {
      return { status: "error", message: "Invalid year" };
    }

    const result = await generateMonthlyBills({ month, year });

    // 🔄 Invalidate caches so master ledger & resident view refresh
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/bills");
    revalidatePath("/resident/ledger");

    return {
      status: "success",
      message: `${result.generatedCount} bills created. ${result.skippedCount} skipped.`,
      result,
    };
  } catch (e) {
    console.error("[generateBillsAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
