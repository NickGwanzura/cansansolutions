export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

async function readSafeFile(root: string, relativePath: string): Promise<Buffer> {
  const rootPath = await fs.realpath(root);
  const requestedPath = await fs.realpath(path.join(rootPath, relativePath));
  if (!requestedPath.startsWith(`${rootPath}${path.sep}`)) throw new Error('Invalid path');
  const stats = await fs.stat(requestedPath);
  if (!stats.isFile() || stats.size > MAX_IMAGE_BYTES) throw new Error('Invalid image');
  return fs.readFile(requestedPath);
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join('/');

    // Security: prevent directory traversal
    if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Try uploads directory first (runtime uploads)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      const buffer = await readSafeFile(uploadsDir, relativePath);
      const ext = path.extname(relativePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    } catch {
      // Fallback to public directory (build-time files)
      const publicDir = path.join(process.cwd(), 'public');
      const buffer = await readSafeFile(publicDir, relativePath);
      const ext = path.extname(relativePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    }
  } catch (error) {
    console.error('[Images] Error serving image:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
