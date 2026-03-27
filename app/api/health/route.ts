export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    redis: { status: 'unknown' },
  };

  try {
    if (redis) {
      await redis.ping();
      checks.redis = { status: 'ok' };
    } else {
      checks.redis = { status: 'error', message: 'Redis not initialized' };
    }
  } catch (error) {
    checks.redis = { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  const allOk = checks.redis.status === 'ok';
  
  return NextResponse.json(checks, { 
    status: allOk ? 200 : 500 
  });
}
