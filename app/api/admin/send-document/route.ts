export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { getCompanyProfile } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 20 * 1024 * 1024)
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const ip =
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const limit = checkRateLimit(`admin-email:${ip}`, 20, 300);
  if (!limit.allowed)
    return NextResponse.json(
      { error: 'Too many email requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
    );

  try {
    const body = await req.json();
    const { to, documentType, documentNumber, customerName, total, currency, pdfBase64 } = body;

    // Validate required fields
    if (
      !to ||
      !documentType ||
      !documentNumber ||
      !customerName ||
      total === undefined ||
      !currency ||
      !pdfBase64
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof to !== 'string' || to.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (!['Invoice', 'Quote', 'Receipt'].includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    if (
      typeof pdfBase64 !== 'string' ||
      pdfBase64.length > 15 * 1024 * 1024 ||
      !/^[A-Za-z0-9+/=_-]+$/.test(pdfBase64)
    ) {
      return NextResponse.json({ error: 'Invalid or oversized PDF attachment' }, { status: 400 });
    }
    if (
      String(customerName).length > 200 ||
      String(documentNumber).length > 100 ||
      String(total).length > 50
    ) {
      return NextResponse.json({ error: 'Document fields are too long' }, { status: 400 });
    }

    // Get company profile for sender details
    let companyName = 'Cansan Solutions';
    let companyLogoUrl = '/images/brand/cansan-logo.png';
    let tinNumber = '';
    let vatNumber = '';
    let vendorNumber = '';

    try {
      const profile = await getCompanyProfile();
      if (profile) {
        companyName = profile.name || companyName;
        companyLogoUrl = profile.logoUrl || companyLogoUrl;
        tinNumber = profile.tinNumber || '';
        vatNumber = profile.vatNumber || '';
        vendorNumber = profile.vendorNumber || '';
      }
    } catch {
      // Use defaults
    }

    // Dynamic import so build doesn't require RESEND_API_KEY
    const { sendDocumentEmail } = await import('@/lib/email/send-invoice');

    const result = await sendDocumentEmail({
      to,
      documentType: documentType as 'Invoice' | 'Quote' | 'Receipt',
      documentNumber,
      customerName,
      total,
      currency,
      pdfBase64,
      companyName,
      companyLogoUrl,
      tinNumber,
      vatNumber,
      vendorNumber,
    });

    if (result.success) {
      return NextResponse.json({ ok: true, id: result.id });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('[Send Document] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
