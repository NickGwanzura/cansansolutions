export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteProductById } from '@/lib/admin-data';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  try {
    const store = await cookies();
    return store.get('admin_auth')?.value === ADMIN_PASSWORD;
  } catch (e) {
    return false;
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await checkAuth())) {
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
