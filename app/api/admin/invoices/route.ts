import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Invoice } from '@/lib/types';
import { getInvoices, saveInvoice, getNextInvoiceNumber } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getInvoices());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<Invoice>;
    const number = body.number || await getNextInvoiceNumber();
    const lineItems = (body.lineItems || []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = body.taxRate ?? 0;
    const discount = body.discount ?? 0;
    const taxAmount = subtotal * taxRate / 100;
    const total = subtotal + taxAmount - discount;

    const invoice: Invoice = {
      id: body.id || `inv-${Date.now()}`,
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
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
    };

    const saved = await saveInvoice(invoice);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
