import ExpenseManager from "@/components/templates/ExpenseManager";

export default function ResidentExpensesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <ExpenseManager isAdmin={false} />
    </div>
  );
}
