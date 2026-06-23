import "server-only";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface ExpenseRow {
  id: string;
  month: number;
  year: number;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseStats {
  thisMonthTotal: number;
  lastMonthTotal: number;
  monthDeltaPercent: number; // positive = up vs last month
  avgMonthly6m: number;
  largestCategoryThisMonth: {
    category: string;
    amount: number;
  } | null;
  // For breakdown widget
  thisMonthByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export interface AdminExpensesData {
  rows: ExpenseRow[];
  stats: ExpenseStats;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
  };
}

function getPreviousMonthYear() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    month: prev.getMonth() + 1,
    year: prev.getFullYear(),
  };
}

function getSixMonthsAgoYear() {
  const now = new Date();
  const sixAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { month: sixAgo.getMonth() + 1, year: sixAgo.getFullYear() };
}

// ─────────────────────────────────────────────────────────────
//  Admin query — all expenses + stats
// ─────────────────────────────────────────────────────────────

export async function getAdminExpenses(): Promise<AdminExpensesData> {
  // Fetch ALL expenses (small dataset, ~12-100 per year)
  const expenses = await prisma.monthlyExpense.findMany({
    select: {
      id: true,
      month: true,
      year: true,
      category: true,
      amount: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
  });

  // ─── Calculate stats ───
  const current = getCurrentMonthYear();
  const previous = getPreviousMonthYear();
  const sixAgo = getSixMonthsAgoYear();

  // This month total
  const thisMonthExpenses = expenses.filter(
    (e) => e.month === current.month && e.year === current.year,
  );
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  // Last month total
  const lastMonthTotal = expenses
    .filter((e) => e.month === previous.month && e.year === previous.year)
    .reduce((s, e) => s + e.amount, 0);

  // Delta (% change vs last month)
  const monthDeltaPercent =
    lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

  // Average monthly (last 6 months including this month)
  const sixMonthsAgoTimestamp = new Date(
    sixAgo.year,
    sixAgo.month - 1,
    1,
  ).getTime();

  const recent6mExpenses = expenses.filter((e) => {
    const ts = new Date(e.year, e.month - 1, 1).getTime();
    return ts >= sixMonthsAgoTimestamp;
  });
  const recent6mTotal = recent6mExpenses.reduce((s, e) => s + e.amount, 0);
  const avgMonthly6m = recent6mTotal / 6;

  // Largest category this month
  const categoryTotals = new Map<string, { amount: number; count: number }>();
  for (const e of thisMonthExpenses) {
    const existing = categoryTotals.get(e.category);
    if (existing) {
      existing.amount += e.amount;
      existing.count += 1;
    } else {
      categoryTotals.set(e.category, { amount: e.amount, count: 1 });
    }
  }

  let largestCategoryThisMonth: ExpenseStats["largestCategoryThisMonth"] = null;
  let largestAmount = 0;
  for (const [category, { amount }] of categoryTotals.entries()) {
    if (amount > largestAmount) {
      largestAmount = amount;
      largestCategoryThisMonth = { category, amount };
    }
  }

  const thisMonthByCategory = Array.from(categoryTotals.entries())
    .map(([category, { amount, count }]) => ({ category, amount, count }))
    .sort((a, b) => b.amount - a.amount);

  const stats: ExpenseStats = {
    thisMonthTotal,
    lastMonthTotal,
    monthDeltaPercent,
    avgMonthly6m,
    largestCategoryThisMonth,
    thisMonthByCategory,
  };

  return {
    rows: expenses,
    stats,
  };
}

// ─────────────────────────────────────────────────────────────
//  Single expense fetch (for edit form pre-fill)
// ─────────────────────────────────────────────────────────────

export async function getExpenseById(id: string) {
  return prisma.monthlyExpense.findUnique({
    where: { id },
    select: {
      id: true,
      month: true,
      year: true,
      category: true,
      amount: true,
      description: true,
    },
  });
}

// ─────────────────────────────────────────────────────────────
//  Resident query — read-only summary
//  Shows: this month + last month + breakdown by category
// ─────────────────────────────────────────────────────────────

export interface ResidentExpensesData {
  thisMonth: {
    month: number;
    year: number;
    total: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  lastMonth: {
    month: number;
    year: number;
    total: number;
  };
  /** Last 6 months totals for trend display */
  recentMonths: Array<{
    month: number;
    year: number;
    total: number;
  }>;
}

export async function getResidentExpenses(): Promise<ResidentExpensesData> {
  const current = getCurrentMonthYear();
  const previous = getPreviousMonthYear();
  const sixAgo = getSixMonthsAgoYear();

  const sixMonthsAgoTimestamp = new Date(
    sixAgo.year,
    sixAgo.month - 1,
    1,
  ).getTime();

  // Fetch recent 6 months only (limit data going to resident)
  const expenses = await prisma.monthlyExpense.findMany({
    where: {
      OR: [
        { year: { gt: sixAgo.year } },
        {
          year: sixAgo.year,
          month: { gte: sixAgo.month },
        },
      ],
    },
    select: {
      month: true,
      year: true,
      category: true,
      amount: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // This month breakdown
  const thisMonthExpenses = expenses.filter(
    (e) => e.month === current.month && e.year === current.year,
  );
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const thisMonthByCat = new Map<string, number>();
  for (const e of thisMonthExpenses) {
    thisMonthByCat.set(
      e.category,
      (thisMonthByCat.get(e.category) ?? 0) + e.amount,
    );
  }

  const byCategory = Array.from(thisMonthByCat.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: thisMonthTotal > 0 ? (amount / thisMonthTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Last month
  const lastMonthTotal = expenses
    .filter((e) => e.month === previous.month && e.year === previous.year)
    .reduce((s, e) => s + e.amount, 0);

  // Recent 6 months totals (for trend)
  const monthlyMap = new Map<string, number>();
  for (const e of expenses) {
    const key = `${e.year}-${e.month}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + e.amount);
  }

  const recentMonths = Array.from(monthlyMap.entries())
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);
      return { month, year, total };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    })
    .slice(0, 6);

  return {
    thisMonth: {
      month: current.month,
      year: current.year,
      total: thisMonthTotal,
      byCategory,
    },
    lastMonth: {
      month: previous.month,
      year: previous.year,
      total: lastMonthTotal,
    },
    recentMonths,
  };
}
