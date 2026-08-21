import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Quote } from '@/lib/types';
import { getQuotes, saveQuote, getNextQuoteNumber } from '@/lib/db';
import {
  currency,
  customer,
  dateOnly,
  finiteNumber,
  lineItems,
  note,
  ValidationError,
} from '@/lib/api-validation';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getQuotes());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<Quote>;
    const number = body.number || (await getNextQuoteNumber());
    const items = lineItems(body.lineItems);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = finiteNumber(body.taxRate ?? 0, 'Tax rate', { min: 0, max: 100 });
    const discount = finiteNumber(body.discount ?? 0, 'Discount', { min: 0, max: subtotal });
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    const quote: Quote = {
      id: body.id || `quo-${Date.now()}`,
      number,
      status: body.status || 'draft',
      customer: customer(body.customer),
      lineItems: items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: currency(body.currency),
      notes: note(body.notes),
      issueDate: dateOnly(body.issueDate || new Date().toISOString().split('T')[0], 'Issue date'),
      validUntil: dateOnly(
        body.validUntil || new Date().toISOString().split('T')[0],
        'Valid until',
      ),
    };

    const saved = await saveQuote(quote);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json(
      { error: message },
      { status: error instanceof ValidationError ? 400 : 500 },
    );
  }
}
