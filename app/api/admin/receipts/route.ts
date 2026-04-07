import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Receipt } from '@/lib/types';
import { getReceipts, saveReceipt, getNextReceiptNumber } from '@/lib/db';

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
    const body = await req.json() as Partial<Receipt>;
    const number = body.number || await getNextReceiptNumber();
    const lineItems = (body.lineItems || []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = body.taxRate ?? 0;
    const discount = body.discount ?? 0;
    const taxAmount = subtotal * taxRate / 100;
    const total = subtotal + taxAmount - discount;

    const receipt: Receipt = {
      id: body.id || `rec-${Date.now()}`,
      number,
      invoiceId: body.invoiceId,
      customer: body.customer || { name: '', email: '', phone: '', address: '' },
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: body.currency || 'USD',
      paymentMethod: body.paymentMethod || 'cash',
      notes: body.notes,
      paidAt: body.paidAt || new Date().toISOString().split('T')[0],
    };

    const saved = await saveReceipt(receipt);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create receipt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
