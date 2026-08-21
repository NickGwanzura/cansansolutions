export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { readProducts, updateProduct } from '@/lib/admin-data';
import { generateSpecsWithGroq } from '@/lib/groq-specs';

type EnrichPayload = {
  ids?: string[];
  onlyMissing?: boolean;
  overwrite?: boolean;
};

function specsToComparable(specs: Record<string, string> | undefined) {
  const sortedEntries = Object.entries(specs ?? {}).sort(([left], [right]) => left.localeCompare(right));
  return JSON.stringify(sortedEntries);
}

function isPlaceholderSpecValue(value: string) {
  const normalized = value.toLowerCase().trim();
  return (
    normalized === 'n/a' ||
    normalized === 'na' ||
    normalized === 'none' ||
    normalized === 'unknown' ||
    normalized === 'not specified' ||
    normalized === 'not available' ||
    normalized === 'tbd'
  );
}

function cleanSpecs(specs: Record<string, string> | undefined) {
  return Object.fromEntries(
    Object.entries(specs ?? {}).filter(([, value]) => !isPlaceholderSpecValue(String(value)))
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as EnrichPayload;
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const onlyMissing = body.onlyMissing !== false;
    const overwrite = body.overwrite === true;

    const products = await readProducts({ allowFallback: false });
    const targets = ids.length > 0 ? products.filter((product) => ids.includes(product.id)) : products;

    if (targets.length === 0) {
      return NextResponse.json({ success: true, updated: 0, skipped: 0, failed: 0, failures: [] });
    }

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const failures: Array<{ id: string; name: string; error: string }> = [];

    for (const product of targets) {
      try {
        const currentSpecs = product.specs ?? {};
        const cleanedCurrentSpecs = cleanSpecs(currentSpecs);
        const hasUsableExistingSpecs = Object.keys(cleanedCurrentSpecs).length > 0;

        if (onlyMissing && hasUsableExistingSpecs) {
          skipped += 1;
          continue;
        }

        const generatedSpecs = await generateSpecsWithGroq({
          name: product.name,
          category: product.category,
          condition: product.condition,
          price: product.price,
          tags: product.tags,
          description: product.description,
          currentSpecs: cleanedCurrentSpecs,
        });

        if (Object.keys(generatedSpecs).length === 0) {
          skipped += 1;
          continue;
        }

        const mergedSpecs = overwrite
          ? { ...cleanedCurrentSpecs, ...generatedSpecs }
          : { ...generatedSpecs, ...cleanedCurrentSpecs };

        if (specsToComparable(mergedSpecs) === specsToComparable(currentSpecs)) {
          skipped += 1;
          continue;
        }

        await updateProduct(product.id, { specs: mergedSpecs });
        updated += 1;
      } catch (error) {
        failed += 1;
        failures.push({
          id: product.id,
          name: product.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      failed,
      processed: targets.length,
      failures: failures.slice(0, 20),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enrich product specs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
