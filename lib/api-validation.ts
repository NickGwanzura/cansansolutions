import type { CustomerInfo, LineItem } from './types';

export class ValidationError extends Error {}

const CURRENCIES = new Set(['USD', 'ZAR', 'GBP', 'EUR', 'ZWG']);

export function finiteNumber(
  value: unknown,
  label: string,
  options: { min?: number; max?: number } = {},
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (
    !Number.isFinite(number) ||
    number < (options.min ?? -Infinity) ||
    number > (options.max ?? Infinity)
  ) {
    throw new ValidationError(`${label} must be a valid number`);
  }
  return number;
}

export function currency(value: unknown): string {
  const result = String(value || 'USD')
    .trim()
    .toUpperCase();
  if (!CURRENCIES.has(result)) throw new ValidationError('Unsupported currency');
  return result;
}

export function dateOnly(value: unknown, label: string): string {
  const result = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    throw new ValidationError(`${label} must be a valid date`);
  }
  return result;
}

export function customer(value: unknown): CustomerInfo {
  if (!value || typeof value !== 'object')
    throw new ValidationError('Customer details are required');
  const data = value as Record<string, unknown>;
  const name = String(data.name || '').trim();
  if (!name || name.length > 160) throw new ValidationError('Customer name is required');
  const email = String(data.email || '').trim();
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    throw new ValidationError('Invalid customer email');
  return {
    name,
    email,
    phone: String(data.phone || '')
      .trim()
      .slice(0, 40),
    address: String(data.address || '')
      .trim()
      .slice(0, 500),
    company: data.company ? String(data.company).trim().slice(0, 160) : undefined,
  };
}

export function lineItems(value: unknown): LineItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 500) {
    throw new ValidationError('At least one line item is required');
  }
  return value.map((raw, index) => {
    if (!raw || typeof raw !== 'object')
      throw new ValidationError(`Invalid line item ${index + 1}`);
    const item = raw as Record<string, unknown>;
    const description = String(item.description || '').trim();
    if (!description || description.length > 500)
      throw new ValidationError(`Line item ${index + 1} needs a description`);
    const quantity = finiteNumber(item.quantity, `Line item ${index + 1} quantity`, {
      min: 0.001,
      max: 100000,
    });
    const unitPrice = finiteNumber(item.unitPrice, `Line item ${index + 1} price`, {
      min: 0,
      max: 100000000,
    });
    return {
      id: String(item.id || `item-${index + 1}`).slice(0, 100),
      description,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });
}

export function note(value: unknown): string | undefined {
  return value == null ? undefined : String(value).trim().slice(0, 5000);
}
