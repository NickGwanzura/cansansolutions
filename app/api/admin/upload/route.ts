export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const limit = checkRateLimit(`admin-upload:${ip}`, 30, 300);
    if (!limit.allowed)
      return NextResponse.json(
        { error: 'Too many uploads. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
      );
    if (!(await checkAdminAuth(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.UPLOADTHING_TOKEN) {
      return NextResponse.json(
        { error: 'Image upload service is not configured' },
        { status: 503 },
      );
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ascii = (start: number, length: number) =>
      String.fromCharCode(...bytes.slice(start, start + length));
    const isValidSignature =
      (file.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
      (file.type === 'image/png' && ascii(1, 3) === 'PNG') ||
      (file.type === 'image/webp' && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') ||
      (file.type === 'image/avif' && ascii(4, 4) === 'ftyp');
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'The uploaded file is not a valid image' },
        { status: 400 },
      );
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error('[Upload] UploadThing error:', response.error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: response.data.ufsUrl, success: true });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
