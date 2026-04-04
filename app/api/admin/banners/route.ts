import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const BANNERS_FILE = path.join(DATA_DIR, 'banners.json');

async function checkAuth(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const adminToken = process.env.ADMIN_PASSWORD || 'cansan2024';
  return cookie.includes(`admin_session=${adminToken}`);
}

async function readBanners(): Promise<any[]> {
  try {
    const data = await fs.readFile(BANNERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeBanners(banners: any[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BANNERS_FILE, JSON.stringify(banners, null, 2));
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const banners = await readBanners();
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const banner = await req.json();
    const banners = await readBanners();
    
    const newBanner = {
      ...banner,
      id: banner.id || `banner-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    banners.push(newBanner);
    await writeBanners(banners);
    
    return NextResponse.json(newBanner);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const banner = await req.json();
    const banners = await readBanners();
    
    const index = banners.findIndex((b: any) => b.id === banner.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }
    
    banners[index] = { ...banners[index], ...banner };
    await writeBanners(banners);
    
    return NextResponse.json(banners[index]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await req.json();
    const banners = await readBanners();
    
    const filtered = banners.filter((b: any) => b.id !== id);
    await writeBanners(filtered);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
