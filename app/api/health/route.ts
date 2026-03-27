export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
    },
  };

  // Test database
  try {
    const result = await query('SELECT NOW() as now');
    checks.db = { status: 'ok', now: result[0]?.now };
  } catch (error) {
    checks.db = { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const allOk = checks.db.status === 'ok';
  
  return NextResponse.json(checks, { 
    status: allOk ? 200 : 500 
  });
}
