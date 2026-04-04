import { NextRequest, NextResponse } from 'next/server';
import { updateProducts } from '@/lib/admin-data';
import { checkAdminAuth } from '@/lib/check-admin-auth';

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, changes } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      );
    }

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    // Allowed bulk update fields
    const allowedFields = ['category', 'inStock', 'featured', 'price', 'currency'];
    const sanitizedChanges: Partial<Record<string, unknown>> = {};
    
    for (const field of allowedFields) {
      if (field in changes) {
        sanitizedChanges[field] = changes[field];
      }
    }

    if (Object.keys(sanitizedChanges).length === 0) {
      return NextResponse.json(
        { error: 'No valid changes provided' },
        { status: 400 }
      );
    }

    const updated = await updateProducts(ids, sanitizedChanges);

    return NextResponse.json({ 
      success: true, 
      updated,
      message: `${updated} products updated`
    });
  } catch (error) {
    console.error('[Bulk Update API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update products' },
      { status: 500 }
    );
  }
}
