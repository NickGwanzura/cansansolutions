import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { CompanyProfile } from '@/lib/types';
import { getCompanyProfile, saveCompanyProfile } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getCompanyProfile());
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as Partial<CompanyProfile>;
    const existing = await getCompanyProfile();
    const merged: CompanyProfile = {
      ...existing,
      ...body,
      id: 'default',
    };
    const saved = await saveCompanyProfile(merged);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update company profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
