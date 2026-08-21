import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const database = await checkDatabaseHealth();
  const uploadthing = Boolean(process.env.UPLOADTHING_TOKEN);
  const email = Boolean(process.env.RESEND_API_KEY);
  return NextResponse.json(
    {
      status: database.configured && !database.reachable ? 'degraded' : 'ok',
      dependencies: { database, uploadthing, email },
      timestamp: new Date().toISOString(),
    },
    { status: database.configured && !database.reachable ? 503 : 200 },
  );
}
