import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import {
  getInvoices,
  getQuotes,
  getReceipts,
  getExpenses,
  getProducts,
  getClients,
  getDeliveryNotes,
} from '@/lib/db';

const LOW_STOCK_THRESHOLD = 5;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function daysBetween(a: string, b: Date) {
  const d = new Date(a);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  return Math.floor((d.getTime() - b.getTime()) / 86_400_000);
}

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [invoices, quotes, receipts, expenses, products, clients, deliveryNotes] = await Promise.all([
      getInvoices(),
      getQuotes(),
      getReceipts(),
      getExpenses(),
      getProducts(),
      getClients(),
      getDeliveryNotes(),
    ]);

    const now = new Date();
    const mtdKey = monthKey(now);
    const inMonth = (date: string) => (date ?? '').startsWith(mtdKey);

    const mtdReceived = receipts.filter((r) => inMonth(r.paidAt)).reduce((s, r) => s + r.total, 0);
    const mtdInvoiced = invoices.filter((i) => inMonth(i.issueDate)).reduce((s, i) => s + i.total, 0);
    const mtdExpenses = expenses.filter((e) => inMonth(e.date)).reduce((s, e) => s + e.amount, 0);
    const netCashMtd = mtdReceived - mtdExpenses;

    const outstandingInvoices = invoices.filter((i) => ['draft', 'sent'].includes(i.status));
    const outstanding = outstandingInvoices.reduce((s, i) => s + i.total, 0);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const overdueInvoices = invoices.filter((i) => {
      if (i.status === 'overdue') return true;
      if (!['draft', 'sent'].includes(i.status)) return false;
      const delta = daysBetween(i.dueDate, today);
      return Number.isFinite(delta) && delta < 0;
    });
    const overdueAmount = overdueInvoices.reduce((s, i) => s + i.total, 0);

    const pendingQuotes = quotes.filter((q) => ['draft', 'sent'].includes(q.status));
    const pendingQuotesAmount = pendingQuotes.reduce((s, q) => s + q.total, 0);
    const acceptedQuotesMtd = quotes
      .filter((q) => q.status === 'accepted' && inMonth(q.issueDate))
      .reduce((s, q) => s + q.total, 0);

    // ─── KPIs ───
    const summary = {
      mtdInvoiced,
      mtdReceived,
      mtdExpenses,
      netCashMtd,
      outstanding,
      outstandingCount: outstandingInvoices.length,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      quotesPending: pendingQuotesAmount,
      quotesPendingCount: pendingQuotes.length,
      acceptedQuotesMtd,
      totalClients: clients.length,
      totalProducts: products.length,
    };

    // ─── Attention panel ───
    const expiringQuotes = quotes
      .filter((q) => ['draft', 'sent'].includes(q.status) && q.validUntil)
      .map((q) => ({ ...q, _daysLeft: daysBetween(q.validUntil, today) }))
      .filter((q) => Number.isFinite(q._daysLeft) && q._daysLeft >= 0 && q._daysLeft <= 7)
      .sort((a, b) => (a._daysLeft as number) - (b._daysLeft as number));

    const outOfStockFeatured = products.filter((p) => p.featured && !p.inStock);
    const lowStock = products
      .filter((p) => p.inStock && typeof p.stockCount === 'number' && p.stockCount <= LOW_STOCK_THRESHOLD && p.stockCount > 0);

    const attention = {
      overdueInvoices: overdueInvoices.slice(0, 5).map((i) => ({
        id: i.id,
        number: i.number,
        customer: i.customer.name,
        total: i.total,
        currency: i.currency,
        dueDate: i.dueDate,
        daysLate: Math.abs(daysBetween(i.dueDate, today) || 0),
      })),
      expiringQuotes: expiringQuotes.slice(0, 5).map((q) => ({
        id: q.id,
        number: q.number,
        customer: q.customer.name,
        total: q.total,
        currency: q.currency,
        validUntil: q.validUntil,
        daysLeft: q._daysLeft as number,
      })),
      outOfStockFeatured: outOfStockFeatured.slice(0, 5).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
      })),
      lowStock: lowStock.slice(0, 5).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        stockCount: p.stockCount ?? 0,
      })),
    };

    // ─── Revenue vs expenses (last 12 months) ───
    const months: { key: string; label: string; revenue: number; expenses: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const revenue = receipts.filter((r) => (r.paidAt ?? '').startsWith(key)).reduce((s, r) => s + r.total, 0);
      const monthExpenses = expenses.filter((e) => (e.date ?? '').startsWith(key)).reduce((s, e) => s + e.amount, 0);
      months.push({ key, label, revenue, expenses: monthExpenses });
    }

    // ─── Top customers (last 90 days, by invoiced amount) ───
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 86_400_000);
    const recentInvoices = invoices.filter((i) => {
      const d = new Date(i.issueDate);
      return !Number.isNaN(d.getTime()) && d >= ninetyDaysAgo;
    });
    const customerMap = new Map<string, { name: string; invoiceCount: number; totalInvoiced: number; totalPaid: number }>();
    for (const inv of recentInvoices) {
      const name = inv.customer.name || 'Unknown';
      const row = customerMap.get(name) ?? { name, invoiceCount: 0, totalInvoiced: 0, totalPaid: 0 };
      row.invoiceCount += 1;
      row.totalInvoiced += inv.total;
      if (inv.status === 'paid') row.totalPaid += inv.total;
      customerMap.set(name, row);
    }
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
      .slice(0, 5);

    // ─── Recent activity (latest 10) ───
    const activity = [
      ...invoices.map((i) => ({
        type: 'invoice' as const,
        label: `Invoice ${i.number}`,
        description: i.customer.name || '—',
        amount: i.total,
        currency: i.currency,
        date: i.issueDate,
        status: i.status,
        href: `/admin/invoices`,
      })),
      ...quotes.map((q) => ({
        type: 'quote' as const,
        label: `Quote ${q.number}`,
        description: q.customer.name || '—',
        amount: q.total,
        currency: q.currency,
        date: q.issueDate,
        status: q.status,
        href: `/admin/quotes`,
      })),
      ...receipts.map((r) => ({
        type: 'receipt' as const,
        label: `Receipt ${r.number}`,
        description: r.customer.name || '—',
        amount: r.total,
        currency: r.currency,
        date: r.paidAt,
        status: 'paid',
        href: `/admin/receipts`,
      })),
      ...expenses.map((e) => ({
        type: 'expense' as const,
        label: e.description || 'Expense',
        description: e.vendor || e.category,
        amount: e.amount,
        currency: e.currency,
        date: e.date,
        status: e.category,
        href: `/admin/expenses`,
      })),
      ...deliveryNotes.map((d) => ({
        type: 'delivery' as const,
        label: `Delivery ${d.number}`,
        description: d.customer.name || '—',
        amount: d.total,
        currency: d.currency,
        date: d.issueDate,
        status: d.status,
        href: `/admin/delivery-notes`,
      })),
    ]
      .filter((a) => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);

    return NextResponse.json({
      summary,
      attention,
      months,
      topCustomers,
      activity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to build overview';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
