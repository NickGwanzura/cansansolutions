export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: Request,
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
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';
      
      return new NextResponse(buffer, {
        headers: { 'Content-Type': contentType },
      });
    } catch {
      // Fallback to public directory (build-time files)
      const publicDir = path.join(process.cwd(), 'public');
      const publicFilePath = path.join(publicDir, relativePath);
      
      const buffer = await fs.readFile(publicFilePath);
      const ext = path.extname(relativePath).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';
      
      return new NextResponse(buffer, {
        headers: { 'Content-Type': contentType },
      });
    }
  } catch (error) {
    console.error('[Images] Error serving image:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
