import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Client } from '@/lib/types';
import { getClients, saveClient } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getClients());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<Client>;

    const client: Client = {
      id: body.id || `client-${Date.now()}`,
      name: body.name || '',
      company: body.company,
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      notes: body.notes,
    };

    const saved = await saveClient(client);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
