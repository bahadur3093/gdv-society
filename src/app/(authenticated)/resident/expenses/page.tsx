import { TrendingDown } from "lucide-react";
import { requireResident } from "@/lib/auth/auth";
import { getResidentExpenses } from "@/lib/expenses/getExpenses";
import PageHeader from "@/components/navigation/PageHeader";
import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import ExpensesHeroCard from "./_components/ExpensesHeroCard";
import MonthBreakdown from "./_components/MonthBreakdown";
import SixMonthTrend from "./_components/SixMonthTrend";

export const dynamic = "force-dynamic";

export const metadata = { title: "Society Finances — GDV Resident Hub" };

export default async function ResidentExpensesPage() {
  await requireResident();
  const data = await getResidentExpenses();

  const hasData =
    data.thisMonth.total > 0 ||
    data.lastMonth.total > 0 ||
    data.recentMonths.length > 0;

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        }
        title="Society Finances"
        description="See how your society's monthly maintenance is being spent."
      />

      {!hasData ? (
        <Card padding="lg">
          <EmptyState
            icon={<TrendingDown />}
            title="No expenses recorded yet"
            description="Once the admin starts recording society expenses, you'll see a transparent breakdown here."
            tone="info"
            size="md"
          />
        </Card>
      ) : (
        <>
          <ExpensesHeroCard
            thisMonth={data.thisMonth}
            lastMonth={data.lastMonth}
          />

          {data.thisMonth.byCategory.length > 0 && (
            <MonthBreakdown
              month={data.thisMonth.month}
              year={data.thisMonth.year}
              total={data.thisMonth.total}
              breakdown={data.thisMonth.byCategory}
            />
          )}

          {data.recentMonths.length > 0 && (
            <SixMonthTrend months={data.recentMonths} />
          )}
        </>
      )}
    </div>
  );
}
