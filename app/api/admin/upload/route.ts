export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    if (!(await checkAdminAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit file size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
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
