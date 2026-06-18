import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExpenseManager from '@/components/templates/ExpenseManager';
import { prisma } from '@/lib/prisma';

export default async function ExpenseManagerPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  // Fetch user to check if admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <ExpenseManager isAdmin={isAdmin} />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Expense Manager | Society Management',
  description: 'Track and manage monthly community expenses and collections',
};