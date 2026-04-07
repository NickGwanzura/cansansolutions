import { NextResponse } from 'next/server';
import { getActiveBrands } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json(await getActiveBrands());
  } catch {
    return NextResponse.json([]);
  }
}
