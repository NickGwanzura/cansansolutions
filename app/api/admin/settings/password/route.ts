import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';

export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ADMIN_PASSWORD is deployment configuration, not mutable application data.
  // Returning a successful response here previously made operators believe the
  // password had changed when it had not.
  return NextResponse.json(
    {
      error:
        'Password changes are managed through the ADMIN_PASSWORD deployment environment variable.',
    },
    { status: 501 },
  );
}
