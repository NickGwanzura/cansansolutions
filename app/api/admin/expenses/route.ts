import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Expense } from '@/lib/types';
import { getExpenses, saveExpense } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getExpenses());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<Expense>;
    const expense: Expense = {
      id: body.id || `exp-${Date.now()}`,
      date: body.date || new Date().toISOString().split('T')[0],
      category: body.category || 'other',
      description: body.description || '',
      amount: body.amount ?? 0,
      currency: body.currency || 'USD',
      vendor: body.vendor || '',
      notes: body.notes,
    };

    const saved = await saveExpense(expense);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
