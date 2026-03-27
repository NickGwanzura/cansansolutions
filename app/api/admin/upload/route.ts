import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

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

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    // ALWAYS save to public/images/products so Next.js can serve it
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    
    console.log(`[Upload] Uploading to: ${uploadDir}`);
    console.log(`[Upload] Filename: ${filename}`);
    
    // Create directory recursively
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    console.log(`[Upload] File saved successfully: ${filePath}`);

    // Return URL (served from /images/products/)
    return NextResponse.json({ 
      url: `/images/products/${filename}`,
      success: true 
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
