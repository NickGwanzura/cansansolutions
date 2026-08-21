import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Receipt } from '@/lib/types';
import { getReceipts, saveReceipt, getNextReceiptNumber } from '@/lib/db';
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
  return NextResponse.json(await getReceipts());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<Receipt>;
    const number = body.number || (await getNextReceiptNumber());
    const items = lineItems(body.lineItems);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = finiteNumber(body.taxRate ?? 0, 'Tax rate', { min: 0, max: 100 });
    const discount = finiteNumber(body.discount ?? 0, 'Discount', { min: 0, max: subtotal });
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    const receipt: Receipt = {
      id: body.id || `rec-${Date.now()}`,
      number,
      invoiceId: body.invoiceId,
      customer: customer(body.customer),
      lineItems: items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: currency(body.currency),
      paymentMethod: body.paymentMethod || 'cash',
      notes: note(body.notes),
      paidAt: dateOnly(body.paidAt || new Date().toISOString().split('T')[0], 'Paid date'),
    };

    const saved = await saveReceipt(receipt);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create receipt';
    return NextResponse.json(
      { error: message },
      { status: error instanceof ValidationError ? 400 : 500 },
    );
  }
}
