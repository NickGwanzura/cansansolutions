export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UTApi } from 'uploadthing/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'];

    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error('[Upload] UploadThing error:', response.error);
      return NextResponse.json({ error: 'Upload failed', details: response.error.message }, { status: 500 });
    }

    return NextResponse.json({ url: response.data.ufsUrl, success: true });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
