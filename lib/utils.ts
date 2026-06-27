import type { CartItem } from './types';

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

function currencySymbol(currency?: string): string {
  if (currency === 'USD') return '$';
  if (currency === 'ZWL') return 'ZiG';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  if (currency === 'ZAR') return 'R';
  return '$';
}

function buildOrderMessageLines(items: CartItem[], note = '') {
  const sym = currencySymbol(items[0]?.currency);
  const lines = [
    "Hi Cansan Solutions, I'd like to order:",
    ...items.map((item) => `• ${item.name} ×${item.qty}  —  ${sym}${(item.price * item.qty).toFixed(2)}`),
  ];
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
  lines.push(`\nTotal: ${sym}${total}`);
  if (note.trim()) lines.push(`\nNote: ${note.trim()}`);
  lines.push('\nPlease confirm availability & delivery details.');
  return lines;
}

/** Returns a URI-encoded WhatsApp message string. */
export const getWhatsAppOrderMessage = (items: CartItem[], note = '') => {
  return encodeURIComponent(buildOrderMessageLines(items, note).join('\n'));
};

/** Returns a plain-text preview of the WhatsApp message (not URI-encoded). */
export const buildWhatsAppPreview = (items: CartItem[], note = '') => {
  return buildOrderMessageLines(items, note).join('\n');
};
