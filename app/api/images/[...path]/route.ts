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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join('/');
    
    // Security: prevent directory traversal
    if (relativePath.includes('..')) {
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    // Try uploads directory first (runtime uploads)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const uploadsFilePath = path.join(uploadsDir, relativePath);
    
    try {
      const buffer = await fs.readFile(uploadsFilePath);
      const ext = path.extname(relativePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    } catch {
      // Fallback to public directory (build-time files)
      const publicDir = path.join(process.cwd(), 'public');
      const publicFilePath = path.join(publicDir, relativePath);
      
      const buffer = await fs.readFile(publicFilePath);
      const ext = path.extname(relativePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      return new NextResponse(buffer, {
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
