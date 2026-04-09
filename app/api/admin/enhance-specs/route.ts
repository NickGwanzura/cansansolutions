export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { generateSpecsWithGroq } from '@/lib/groq-specs';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, category, condition, price, tags, description, currentSpecs } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const specs = await generateSpecsWithGroq({
      name,
      category,
      condition,
      price,
      tags,
      description,
      currentSpecs: currentSpecs && typeof currentSpecs === 'object' ? currentSpecs : undefined,
    });

    if (Object.keys(specs).length === 0) {
      return NextResponse.json(
        { error: 'No specs could be generated. Add more product detail and try again.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, specs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate specs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
