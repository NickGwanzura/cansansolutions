import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

export async function checkAdminAuth(req?: NextRequest): Promise<boolean> {
  try {
    if (req) {
      // For route handlers with request object
      const cookie = req.cookies.get('admin_auth')?.value;
      return cookie === ADMIN_PASSWORD;
    } else {
      // For cases where we need to use cookies() directly
      const store = await cookies();
      return store.get('admin_auth')?.value === ADMIN_PASSWORD;
    }
  } catch (e) {
    console.error('[Auth] Cookie check failed:', e);
    return false;
  }
}
