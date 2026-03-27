import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  };
  
  return NextResponse.json(health, { status: 200 });
}
