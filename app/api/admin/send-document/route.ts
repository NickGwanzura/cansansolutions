export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { getCompanyProfile } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { to, documentType, documentNumber, customerName, total, currency, pdfBase64 } = body;

    // Validate required fields
    if (!to || !documentType || !documentNumber || !customerName || total === undefined || !currency || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!to.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
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
