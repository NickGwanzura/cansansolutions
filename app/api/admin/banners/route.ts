import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import type { Banner } from '@/lib/types';
import { deleteBanner, getBanner, getBanners, saveBanner } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getBanners());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const banner = await req.json() as Partial<Banner>;

    if (!banner.name?.trim() || !banner.title?.trim()) {
      return NextResponse.json({ error: 'Banner name and title are required' }, { status: 400 });
    }

    const saved = await saveBanner({
      id: banner.id || `banner-${Date.now()}`,
      name: banner.name.trim(),
      image: banner.image || '',
      title: banner.title.trim(),
      subtitle: banner.subtitle || '',
      badge: banner.badge || '',
      buttonText: banner.buttonText || 'Shop Now',
      buttonLink: banner.buttonLink || '/products',
      active: banner.active ?? true,
      position: banner.position || 'homepage-hero',
      createdAt: banner.createdAt || new Date().toISOString(),
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const banner = await req.json() as Partial<Banner>;
    if (!banner.id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const existing = await getBanner(banner.id);
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const merged: Banner = {
      ...existing,
      ...banner,
      name: (banner.name ?? existing.name).trim(),
      title: (banner.title ?? existing.title).trim(),
      createdAt: existing.createdAt,
    };

    if (!merged.name || !merged.title) {
      return NextResponse.json({ error: 'Banner name and title are required' }, { status: 400 });
    }

    return NextResponse.json(await saveBanner(merged));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const deleted = await deleteBanner(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
