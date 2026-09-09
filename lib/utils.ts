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
  if (currency === 'ZWL' || currency === 'ZWG') return 'ZWL ';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  if (currency === 'ZAR') return 'R';
  return '$';
}

function buildOrderMessageLines(items: CartItem[], note = '') {
  const lines = [
    "Hi Cansan Solutions, I'd like to order:",
    ...items.map(
      (item) => `• ${item.name} ×${item.qty}  -  ${currencySymbol(item.currency)}${(item.price * item.qty).toFixed(2)}`,
    ),
  ];
  const totals = items.reduce<Record<string, number>>((result, item) => {
    result[item.currency] = (result[item.currency] ?? 0) + item.price * item.qty;
    return result;
  }, {});
  const totalText = Object.entries(totals)
    .map(([currency, amount]) => `${currencySymbol(currency)}${amount.toFixed(2)}`)
    .join(' + ');
  lines.push(`\nTotal: ${totalText}`);
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
