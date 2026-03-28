import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    maintenance: {
      enabled: process.env.MAINTENANCE_MODE === 'true',
      passwordSet: !!process.env.MAINTENANCE_PASSWORD,
    },
    timestamp: new Date().toISOString(),
  });
}
