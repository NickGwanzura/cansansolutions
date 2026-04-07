import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Quote } from '@/lib/types';
import { getQuotes, saveQuote, getNextQuoteNumber } from '@/lib/db';

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
    const body = await req.json() as Partial<Quote>;
    const number = body.number || await getNextQuoteNumber();
    const lineItems = (body.lineItems || []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = body.taxRate ?? 0;
    const discount = body.discount ?? 0;
    const taxAmount = subtotal * taxRate / 100;
    const total = subtotal + taxAmount - discount;

    const quote: Quote = {
      id: body.id || `quo-${Date.now()}`,
      number,
      status: body.status || 'draft',
      customer: body.customer || { name: '', email: '', phone: '', address: '' },
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: body.currency || 'USD',
      notes: body.notes,
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      validUntil: body.validUntil || new Date().toISOString().split('T')[0],
    };

    const saved = await saveQuote(quote);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
