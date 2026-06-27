export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { deleteProductById, importProducts } from '@/lib/admin-data';

export async function DELETE(req: Request) {
  try {
    if (!(await checkAdminAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { ids } = await req.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }
    
    console.log('[API BATCH DELETE] Deleting:', ids.length, 'products');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const id of ids) {
      try {
        const success = await deleteProductById(id);
        if (success) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }
    
    console.log('[API BATCH DELETE] Done:', successCount, 'success,', failCount, 'failed');
    
    return NextResponse.json({ 
      success: true, 
      deleted: successCount, 
      failed: failCount 
    });
  } catch (error) {
    console.error('[API BATCH DELETE] ERROR:', error);
    return NextResponse.json({ 
      error: 'Batch delete failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAdminAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { products, mode } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    const normalizedMode = mode === 'append' ? 'append' : 'replace';
    const saved = await importProducts(products, normalizedMode);

    return NextResponse.json({
      success: true,
      count: saved.length,
      mode: normalizedMode,
    });
  } catch (error) {
    console.error('[API BATCH IMPORT] ERROR:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 400 }
    );
  }
}
