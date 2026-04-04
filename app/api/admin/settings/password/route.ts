import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify current password
    const verifyRes = await fetch(`${req.nextUrl.origin}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }),
    });

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Note: In a real implementation, you would update the stored password hash
    // For this demo, we'll just return success
    // The password is stored in an environment variable, so changing it would require
    // updating that variable and restarting the server

    return NextResponse.json({
      success: true,
      message: 'Password change endpoint - In production, update ADMIN_PASSWORD env variable',
    });
  } catch (error) {
    console.error('[Password API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
