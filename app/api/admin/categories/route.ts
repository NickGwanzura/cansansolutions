import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { checkAdminAuth } from '@/lib/check-admin-auth';

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

interface Category {
  id: string;
  label: string;
  icon: string;
  slug: string;
}

async function readCategories(): Promise<Category[]> {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCategories(categories: Category[]): Promise<void> {
  await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// GET /api/admin/categories
export async function GET(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await readCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category: Category = await req.json();
    
    if (!category.id || !category.label || !category.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const categories = await readCategories();
    
    if (categories.find((c) => c.id === category.id)) {
      return NextResponse.json({ error: 'Category ID already exists' }, { status: 400 });
    }

    categories.push(category);
    await writeCategories(categories);

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT /api/admin/categories
export async function PUT(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category: Category = await req.json();
    
    if (!category.id || !category.label || !category.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const categories = await readCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    categories[index] = category;
    await writeCategories(categories);

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const categories = await readCategories();
    const filtered = categories.filter((c) => c.id !== id);
    
    if (filtered.length === categories.length) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await writeCategories(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
