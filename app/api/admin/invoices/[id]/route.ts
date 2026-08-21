import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Invoice } from '@/lib/types';
import { getInvoice, saveInvoice, deleteInvoice } from '@/lib/db';
import {
  currency,
  customer,
  dateOnly,
  finiteNumber,
  lineItems,
  note,
  ValidationError,
} from '@/lib/api-validation';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await getInvoice(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = (await req.json()) as Partial<Invoice>;
    const items = lineItems(body.lineItems ?? existing.lineItems);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = finiteNumber(body.taxRate ?? existing.taxRate, 'Tax rate', {
      min: 0,
      max: 100,
    });
    const discount = finiteNumber(body.discount ?? existing.discount, 'Discount', {
      min: 0,
      max: subtotal,
    });
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    const merged: Invoice = {
      ...existing,
      ...body,
      id,
      lineItems: items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      customer: customer(body.customer ?? existing.customer),
      currency: currency(body.currency ?? existing.currency),
      notes: note(body.notes ?? existing.notes),
      issueDate: dateOnly(body.issueDate ?? existing.issueDate, 'Issue date'),
      dueDate: dateOnly(body.dueDate ?? existing.dueDate, 'Due date'),
      createdAt: existing.createdAt,
    };

    const saved = await saveInvoice(merged);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update invoice';
    return NextResponse.json(
      { error: message },
      { status: error instanceof ValidationError ? 400 : 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await deleteInvoice(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
