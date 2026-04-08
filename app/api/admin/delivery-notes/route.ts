import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { DeliveryNote } from '@/lib/types';
import { getDeliveryNotes, saveDeliveryNote, getNextDeliveryNoteNumber } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getDeliveryNotes());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<DeliveryNote>;
    const number = body.number || await getNextDeliveryNoteNumber();
    const lineItems = (body.lineItems || []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = body.taxRate ?? 0;
    const discount = body.discount ?? 0;
    const taxAmount = subtotal * taxRate / 100;
    const total = subtotal + taxAmount - discount;

    const dn: DeliveryNote = {
      id: body.id || `dn-${Date.now()}`,
      number,
      status: body.status || 'draft',
      customer: body.customer || { name: '', email: '', phone: '', address: '' },
      deliveryAddress: body.deliveryAddress,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: body.currency || 'USD',
      notes: body.notes,
      invoiceRef: body.invoiceRef,
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      deliveryDate: body.deliveryDate,
    };

    const saved = await saveDeliveryNote(dn);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create delivery note';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
