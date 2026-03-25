import type { CartItem } from './types';

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getWhatsAppOrderMessage = (items: CartItem[], note = '') => {
  const lines = [
    "Hi Cansan Solutions, I'd like to order:",
    ...items.map((item) => `• ${item.name} ×${item.qty}  —  $${(item.price * item.qty).toFixed(2)}`),
    `\nTotal: $${items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}`,
  ];
  if (note.trim()) lines.push(`\nNote: ${note.trim()}`);
  lines.push('\nPlease confirm availability & delivery details.');
  return encodeURIComponent(lines.join('\n'));
};
