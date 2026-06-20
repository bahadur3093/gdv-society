import ExpenseManager from "@/components/templates/ExpenseManager";

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <ExpenseManager isAdmin={true} />
    </div>
  );
}
