import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { deleteBrand, getBrand, getBrands, saveBrand } from '@/lib/db';
import type { Brand } from '@/lib/types';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await getBrands());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const brand = await req.json() as Partial<Brand>;

    if (!brand.name?.trim() || !brand.logoUrl?.trim()) {
      return NextResponse.json({ error: 'Brand name and logo are required' }, { status: 400 });
    }

    const saved = await saveBrand({
      id: brand.id || `brand-${Date.now()}`,
      name: brand.name.trim(),
      logoUrl: brand.logoUrl.trim(),
      active: brand.active ?? true,
      sortOrder: Number.isFinite(brand.sortOrder) ? Number(brand.sortOrder) : 0,
      createdAt: brand.createdAt || new Date().toISOString(),
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create brand';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const brand = await req.json() as Partial<Brand>;
    if (!brand.id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    const existing = await getBrand(brand.id);
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const merged: Brand = {
      ...existing,
      ...brand,
      name: (brand.name ?? existing.name).trim(),
      logoUrl: (brand.logoUrl ?? existing.logoUrl).trim(),
      sortOrder: Number.isFinite(brand.sortOrder) ? Number(brand.sortOrder) : existing.sortOrder,
      createdAt: existing.createdAt,
    };

    if (!merged.name || !merged.logoUrl) {
      return NextResponse.json({ error: 'Brand name and logo are required' }, { status: 400 });
    }

    return NextResponse.json(await saveBrand(merged));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update brand';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json() as { id?: string };
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    const deleted = await deleteBrand(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete brand';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
