export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { generateSpecsWithGroq } from '@/lib/groq-specs';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const limit = checkRateLimit(`admin-groq-specs:${ip}`, 30, 300);
    if (!limit.allowed)
      return NextResponse.json(
        { error: 'Too many AI requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
      );

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
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, specs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate specs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
