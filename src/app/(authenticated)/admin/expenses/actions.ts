"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { isValidCategory } from "@/lib/expenses/categories";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface ExpenseActionState {
  status: "idle" | "success" | "error";
  message?: string;
  id?: string;
  errors?: {
    month?: string;
    year?: string;
    category?: string;
    amount?: string;
    description?: string;
  };
}

export interface BatchExpenseEntry {
  category: string;
  amount: number;
  description: string | null;
}

export interface CreateBatchExpensesState {
  status: "idle" | "success" | "error";
  message?: string;
  createdCount?: number;
  /** Index-based errors so UI can highlight specific rows */
  rowErrors?: Array<{ index: number; message: string }>;
}

// ─────────────────────────────────────────────────────────────
//  Validation helper
// ─────────────────────────────────────────────────────────────

interface ParsedExpenseData {
  month: number;
  year: number;
  category: string;
  amount: number;
  description: string | null;
  errors?: ExpenseActionState["errors"];
}

function parseFormData(formData: FormData): ParsedExpenseData {
  const errors: NonNullable<ExpenseActionState["errors"]> = {};

  // Month
  const monthRaw = formData.get("month") as string;
  const month = parseInt(monthRaw, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    errors.month = "Month must be between 1 and 12";
  }

  // Year
  const yearRaw = formData.get("year") as string;
  const year = parseInt(yearRaw, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 2020 || year > currentYear + 1) {
    errors.year = `Year must be between 2020 and ${currentYear + 1}`;
  }

  // Category
  const category = (formData.get("category") as string)?.trim() ?? "";
  if (!category) {
    errors.category = "Category is required";
  } else if (!isValidCategory(category)) {
    errors.category = "Invalid category";
  }

  // Amount
  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than zero";
  } else if (amount > 10_000_000) {
    errors.amount = "Amount seems too large — check the value";
  }

  // Description (optional)
  const description = (formData.get("description") as string)?.trim() || null;
  if (description && description.length > 500) {
    errors.description = "Description must be 500 characters or less";
  }

  return {
    month,
    year,
    category,
    amount,
    description,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────
//  Create expense
// ─────────────────────────────────────────────────────────────

export async function createExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    await requireAdmin();

    const data = parseFormData(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    // Check for the unique constraint: (month, year, category)
    // Schema has @@unique([month, year, category])
    const existing = await prisma.monthlyExpense.findUnique({
      where: {
        month_year_category: {
          month: data.month,
          year: data.year,
          category: data.category,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return {
        status: "error",
        message: `An entry for ${data.category} in ${monthName(
          data.month,
        )} ${data.year} already exists. Edit that entry instead.`,
        errors: { category: "Already exists for this month" },
      };
    }

    const created = await prisma.monthlyExpense.create({
      data: {
        month: data.month,
        year: data.year,
        category: data.category,
        amount: data.amount,
        description: data.description,
      },
    });

    revalidatePath("/admin/expenses");
    revalidatePath("/resident/expenses");
    revalidatePath("/resident");

    return {
      status: "success",
      message: `Expense recorded for ${monthName(data.month)} ${data.year}`,
      id: created.id,
    };
  } catch (e) {
    console.error("[createExpenseAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to record expense",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Edit expense
// ─────────────────────────────────────────────────────────────

export async function editExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) {
      return { status: "error", message: "Missing expense ID" };
    }

    const data = parseFormData(formData);
    if (data.errors) {
      return {
        status: "error",
        message: "Please fix the errors below",
        errors: data.errors,
      };
    }

    const existing = await prisma.monthlyExpense.findUnique({
      where: { id },
      select: { id: true, month: true, year: true, category: true },
    });
    if (!existing) {
      return { status: "error", message: "Expense not found" };
    }

    // If month/year/category combo changed, check for unique conflict
    const isCombinationChanged =
      existing.month !== data.month ||
      existing.year !== data.year ||
      existing.category !== data.category;

    if (isCombinationChanged) {
      const conflict = await prisma.monthlyExpense.findUnique({
        where: {
          month_year_category: {
            month: data.month,
            year: data.year,
            category: data.category,
          },
        },
        select: { id: true },
      });

      if (conflict && conflict.id !== id) {
        return {
          status: "error",
          message: `An entry for ${data.category} in ${monthName(
            data.month,
          )} ${data.year} already exists.`,
          errors: { category: "Already exists for this month" },
        };
      }
    }

    await prisma.monthlyExpense.update({
      where: { id },
      data: {
        month: data.month,
        year: data.year,
        category: data.category,
        amount: data.amount,
        description: data.description,
      },
    });

    revalidatePath("/admin/expenses");
    revalidatePath("/resident/expenses");
    revalidatePath("/resident");

    return {
      status: "success",
      message: "Expense updated",
      id,
    };
  } catch (e) {
    console.error("[editExpenseAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to update expense",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Delete expense
// ─────────────────────────────────────────────────────────────

export async function deleteExpenseAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.monthlyExpense.findUnique({
      where: { id },
      select: { id: true, category: true, month: true, year: true },
    });
    if (!existing) {
      return { status: "error", message: "Expense not found" };
    }

    await prisma.monthlyExpense.delete({ where: { id } });

    revalidatePath("/admin/expenses");
    revalidatePath("/resident/expenses");
    revalidatePath("/resident");

    return {
      status: "success",
      message: `${existing.category} expense for ${monthName(
        existing.month,
      )} ${existing.year} deleted`,
    };
  } catch (e) {
    console.error("[deleteExpenseAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to delete expense",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });
}

export async function createBatchExpensesAction(
  _prev: CreateBatchExpensesState,
  formData: FormData,
): Promise<CreateBatchExpensesState> {
  try {
    await requireAdmin();

    // Parse period
    const monthRaw = formData.get("month") as string;
    const yearRaw = formData.get("year") as string;
    const month = parseInt(monthRaw, 10);
    const year = parseInt(yearRaw, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return { status: "error", message: "Invalid month" };
    }
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2020 || year > currentYear + 1) {
      return { status: "error", message: "Invalid year" };
    }

    // Parse entries — encoded as JSON in 'entries' field
    const entriesJson = formData.get("entries") as string;
    if (!entriesJson) {
      return { status: "error", message: "No entries to save" };
    }

    let entries: BatchExpenseEntry[];
    try {
      entries = JSON.parse(entriesJson);
    } catch {
      return { status: "error", message: "Invalid entries format" };
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return { status: "error", message: "At least one entry is required" };
    }

    // Per-row validation
    const rowErrors: Array<{ index: number; message: string }> = [];
    const seenCategories = new Set<string>();

    entries.forEach((entry, idx) => {
      if (!entry.category || !isValidCategory(entry.category)) {
        rowErrors.push({
          index: idx,
          message: "Invalid category",
        });
        return;
      }

      if (seenCategories.has(entry.category)) {
        rowErrors.push({
          index: idx,
          message: "Category already in this batch",
        });
        return;
      }
      seenCategories.add(entry.category);

      if (
        typeof entry.amount !== "number" ||
        isNaN(entry.amount) ||
        entry.amount <= 0
      ) {
        rowErrors.push({
          index: idx,
          message: "Amount must be greater than zero",
        });
        return;
      }

      if (entry.amount > 10_000_000) {
        rowErrors.push({
          index: idx,
          message: "Amount seems too large",
        });
        return;
      }

      if (entry.description && entry.description.length > 500) {
        rowErrors.push({
          index: idx,
          message: "Description too long",
        });
      }
    });

    if (rowErrors.length > 0) {
      return {
        status: "error",
        message: "Some rows have errors. Fix them before saving.",
        rowErrors,
      };
    }

    // Check for existing DB entries with same (month, year, category)
    const existingForMonth = await prisma.monthlyExpense.findMany({
      where: {
        month,
        year,
        category: { in: entries.map((e) => e.category) },
      },
      select: { category: true },
    });

    if (existingForMonth.length > 0) {
      const conflictCategories = existingForMonth.map((e) => e.category);
      const conflictErrors = entries
        .map((entry, idx) =>
          conflictCategories.includes(entry.category)
            ? {
                index: idx,
                message: `${entry.category} already saved for ${monthName(
                  month,
                )} ${year}. Edit that entry instead.`,
              }
            : null,
        )
        .filter((e): e is { index: number; message: string } => e !== null);

      return {
        status: "error",
        message: "Some categories already exist for this month",
        rowErrors: conflictErrors,
      };
    }

    // All clear — save atomically
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.monthlyExpense.create({
          data: {
            month,
            year,
            category: entry.category,
            amount: entry.amount,
            description: entry.description,
          },
        }),
      ),
    );

    revalidatePath("/admin/expenses");
    revalidatePath("/resident/expenses");
    revalidatePath("/resident");

    return {
      status: "success",
      message: `${entries.length} expense${
        entries.length === 1 ? "" : "s"
      } added for ${monthName(month)} ${year}`,
      createdCount: entries.length,
    };
  } catch (e) {
    console.error("[createBatchExpensesAction] failed", e);
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to save expenses",
    };
  }
}
