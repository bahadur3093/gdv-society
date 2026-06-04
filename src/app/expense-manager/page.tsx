import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ExpenseManager from '@/components/templates/ExpenseManager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function ExpenseManagerPage() {
  const session = await getServerSession();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
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