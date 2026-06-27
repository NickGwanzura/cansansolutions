export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { generateNextNumber } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prefix = req.nextUrl.searchParams.get('prefix');
  if (prefix !== 'INV' && prefix !== 'QTE') {
    return NextResponse.json({ error: 'Invalid prefix' }, { status: 400 });
  }

  const number = await generateNextNumber(prefix);
  return NextResponse.json({ number });
}
