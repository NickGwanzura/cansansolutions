import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import { getInvoices, getReceipts, getExpenses } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [invoices, receipts, expenses] = await Promise.all([
      getInvoices(),
      getReceipts(),
      getExpenses(),
    ]);

    // Monthly breakdown for last 6 months
    const now = new Date();
    const months: { key: string; label: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthRevenue = receipts
        .filter((r) => r.paidAt && r.paidAt.startsWith(key))
        .reduce((s, r) => s + r.total, 0);

      const monthExpenses = expenses
        .filter((e) => e.date && e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);

      months.push({ key, label, revenue: monthRevenue, expenses: monthExpenses });
    }

    // Invoice status summary
    const statusSummary = ['paid', 'sent', 'draft', 'overdue', 'cancelled'].map((status) => {
      const filtered = invoices.filter((i) => i.status === status);
      return {
        status,
        count: filtered.length,
        amount: filtered.reduce((s, i) => s + i.total, 0),
      };
    });

    // Expense category totals
    const categoryTotals: Record<string, number> = {};
    for (const e of expenses) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }

    // Top customers
    const customerMap: Record<string, { name: string; invoiceCount: number; totalInvoiced: number; totalPaid: number }> = {};
    for (const inv of invoices) {
      const name = inv.customer.name || 'Unknown';
      if (!customerMap[name]) {
        customerMap[name] = { name, invoiceCount: 0, totalInvoiced: 0, totalPaid: 0 };
      }
      customerMap[name].invoiceCount++;
      customerMap[name].totalInvoiced += inv.total;
      if (inv.status === 'paid') {
        customerMap[name].totalPaid += inv.total;
      }
    }
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
      .slice(0, 10);

    // Summary totals
    const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const totalReceived = receipts.reduce((s, r) => s + r.total, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalReceived - totalExpenses;
    const outstanding = invoices.filter((i) => ['draft', 'sent'].includes(i.status)).reduce((s, i) => s + i.total, 0);
    const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

    // Recent activity
    type ActivityItem = { type: string; description: string; amount: number; currency: string; date: string };
    const activity: ActivityItem[] = [
      ...invoices.map((i) => ({ type: 'invoice', description: `${i.number} - ${i.customer.name}`, amount: i.total, currency: i.currency, date: i.issueDate })),
      ...receipts.map((r) => ({ type: 'receipt', description: `${r.number} - ${r.customer.name}`, amount: r.total, currency: r.currency, date: r.paidAt })),
      ...expenses.map((e) => ({ type: 'expense', description: `${e.description} - ${e.vendor}`, amount: e.amount, currency: e.currency, date: e.date })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return NextResponse.json({
      summary: { totalRevenue, totalReceived, totalExpenses, netProfit, outstanding, overdue },
      months,
      statusSummary,
      categoryTotals,
      topCustomers,
      activity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
