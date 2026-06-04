import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check if a month/year is in the future
const isFutureMonth = (month: number, year: number): boolean => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
};

// Validation schema for expense creation/update
const expenseSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  category: z.string().min(1).max(100),
  amount: z.number().min(0),
  description: z.string().optional(),
}).refine(
  (data) => !isFutureMonth(data.month, data.year),
  {
    message: 'Cannot create or update expenses for future months',
  }
);

// Validation schema for bulk expense creation
const bulkExpenseSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  expenses: z.array(z.object({
    category: z.string().min(1).max(100),
    amount: z.number().min(0),
    description: z.string().optional(),
  })).min(1),
}).refine(
  (data) => !isFutureMonth(data.month, data.year),
  {
    message: 'Cannot create expenses for future months',
  }
);

/**
 * GET /api/expenses
 * Fetch expenses for a specific month/year or all expenses
 * Query params: month, year (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: { month?: number; year?: number } = {};
    
    if (month && year) {
      const parsedMonth = parseInt(month);
      const parsedYear = parseInt(year);
      
      // Prevent fetching future month data
      if (isFutureMonth(parsedMonth, parsedYear)) {
        return NextResponse.json(
          { error: 'Cannot fetch expenses for future months' },
          { status: 400 }
        );
      }
      
      where.month = parsedMonth;
      where.year = parsedYear;
    }

    const expenses = await prisma.monthlyExpense.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { category: 'asc' },
      ],
    });

    // Calculate total for the requested period
    const total = expenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);

    return NextResponse.json({
      success: true,
      data: expenses,
      total,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Create a new expense entry or multiple expenses in bulk
 * Body can be either:
 * - Single expense: { month, year, category, amount, description? }
 * - Bulk expenses: { month, year, expenses: [{ category, amount, description? }] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Detect if this is a bulk operation
    const isBulk = Array.isArray(body.expenses);

    if (isBulk) {
      // Handle bulk expense creation
      const validatedData = bulkExpenseSchema.parse(body);
      const { month, year, expenses } = validatedData;

      // Check for existing expenses
      const categories = expenses.map(e => e.category);
      const existingExpenses = await prisma.monthlyExpense.findMany({
        where: {
          month,
          year,
          category: { in: categories },
        },
      });

      if (existingExpenses.length > 0) {
        const existingCategories = existingExpenses.map(e => e.category).join(', ');
        return NextResponse.json(
          { 
            error: 'Some expenses already exist for this month and year',
            existingCategories,
            message: `Expenses already exist for categories: ${existingCategories}. Use PUT to update.`
          },
          { status: 409 }
        );
      }

      // Create all expenses in a transaction
      const createdExpenses = await prisma.$transaction(
        expenses.map(expense =>
          prisma.monthlyExpense.create({
            data: {
              month,
              year,
              category: expense.category,
              amount: expense.amount,
              description: expense.description,
            },
          })
        )
      );

      return NextResponse.json(
        {
          success: true,
          data: createdExpenses,
          count: createdExpenses.length,
          message: `${createdExpenses.length} expenses created successfully`,
        },
        { status: 201 }
      );
    } else {
      // Handle single expense creation
      const validatedData = expenseSchema.parse(body);

      // Check if expense already exists for this month/year/category
      const existingExpense = await prisma.monthlyExpense.findUnique({
        where: {
          month_year_category: {
            month: validatedData.month,
            year: validatedData.year,
            category: validatedData.category,
          },
        },
      });

      if (existingExpense) {
        return NextResponse.json(
          { error: 'Expense already exists for this month, year, and category. Use PUT to update.' },
          { status: 409 }
        );
      }

      const expense = await prisma.monthlyExpense.create({
        data: validatedData,
      });

      return NextResponse.json(
        {
          success: true,
          data: expense,
          message: 'Expense created successfully',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating expense:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses
 * Update an existing expense
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const validatedData = expenseSchema.partial().parse(updateData);

    const expense = await prisma.monthlyExpense.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses
 * Delete an expense by ID
 * Query params: id
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    await prisma.monthlyExpense.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}