import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'invoices@cansansolutions.shop';
const SITE_URL = process.env.SITE_URL || 'https://cansansolutions.shop';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send an invoice (or quote/ receipt) as a branded HTML email to the customer.
 */
export async function sendDocumentEmail(params: {
  to: string;
  documentType: 'Invoice' | 'Quote' | 'Receipt';
  documentNumber: string;
  customerName: string;
  total: string;
  currency: string;
  pdfBase64: string; // base64-encoded PDF data (without data: prefix)
  companyName: string;
  companyLogoUrl?: string;
  tinNumber?: string;
  vatNumber?: string;
  vendorNumber?: string;
}) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const {
    to, documentType, documentNumber, customerName, total, currency,
    pdfBase64, companyName, companyLogoUrl, tinNumber, vatNumber, vendorNumber,
  } = params;

  try {
    const { data, error } = await resend.emails.send({
      from: `${companyName} <${FROM_EMAIL}>`,
      to: [to],
      subject: `${documentType} ${documentNumber} from ${companyName}`,
      attachments: [
        {
          filename: `${documentType}-${documentNumber}.pdf`,
          content: pdfBase64,
        },
      ],
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:#dc2626;padding:32px 40px 24px;text-align:center;">
              ${companyLogoUrl ? `<img src="${SITE_URL}${companyLogoUrl}" alt="${companyName}" style="height:48px;width:auto;margin-bottom:16px;" />` : ''}
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${documentType}</h1>
              <p style="margin:4px 0 0;font-size:14px;color:#fca5a5;">${documentNumber}</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#18181b;">Dear ${customerName},</p>
              <p style="margin:0 0 8px;font-size:14px;color:#52525b;">
                Please find attached your ${documentType.toLowerCase()} <strong>${documentNumber}</strong> from ${companyName}.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#52525b;">
                Total amount: <strong style="color:#dc2626;">${currency} ${total}</strong>
              </p>

              <!-- Company details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <tr>
                  <td style="font-size:12px;font-weight:600;color:#71717a;padding-bottom:8px;">Company Details</td>
                </tr>
                ${tinNumber ? `<tr><td style="font-size:13px;color:#18181b;padding:2px 0;">TIN: ${tinNumber}</td></tr>` : ''}
                ${vatNumber ? `<tr><td style="font-size:13px;color:#18181b;padding:2px 0;">VAT: ${vatNumber}</td></tr>` : ''}
                ${vendorNumber ? `<tr><td style="font-size:13px;color:#18181b;padding:2px 0;">Vendor: ${vendorNumber}</td></tr>` : ''}
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#52525b;">
                Please review the attached PDF for full details. If you have any questions, feel free to reply to this email or contact us directly.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#18181b;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">${companyName} &mdash; Zimbabwe Tech Store</p>
              <p style="margin:4px 0 0;font-size:12px;color:#71717a;">
                ${tinNumber ? `TIN ${tinNumber} &bull; ` : ''}${vatNumber ? `VAT ${vatNumber} &bull; ` : ''}${vendorNumber ? `Vendor ${vendorNumber}` : ''}
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#52525b;">
                <a href="${SITE_URL}" style="color:#dc2626;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Failed to send:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
