'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import type { Product } from '@/lib/types';
import { getCategoryLabel } from '@/lib/catalog';

// Simple Bar Chart Component
function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-xs text-zinc-600 truncate">{item.label}</div>
          <div className="flex-1 h-6 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-red-500'}`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <div className="w-10 text-xs font-medium text-zinc-700 text-right">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Pie Chart Component
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {total === 0 ? (
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
          ) : (
            data.map((item, i) => {
              const percentage = (item.value / total) * 100;
              const dashArray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
              const dashOffset = -cumulative * 2.51;
              cumulative += percentage;
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              );
            })
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-zinc-700">{total}</span>
        </div>
      </div>
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-600">{item.label}</span>
            <span className="font-medium text-zinc-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authed) fetchProducts();
  }, [authed]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      setAuthed(res.ok);
    } catch {
      setAuthed(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.reload();
  };

  // Analytics calculations
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = total - inStock;
    const featured = products.filter((p) => p.featured).length;
    const bundles = products.filter((p) => p.productType === 'bundle').length;
    const singleProducts = total - bundles;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;

    // Category breakdown
    const categoryData = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryChart = Object.entries(categoryData)
      .map(([id, count]) => ({
        label: getCategoryLabel(id),
        value: count,
        color: 'bg-blue-500',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Price ranges
    const priceRanges = [
      { label: '$0-50', min: 0, max: 50, value: 0, color: '#22c55e' },
      { label: '$50-100', min: 50, max: 100, value: 0, color: '#3b82f6' },
      { label: '$100-500', min: 100, max: 500, value: 0, color: '#f59e0b' },
      { label: '$500-1000', min: 500, max: 1000, value: 0, color: '#ef4444' },
      { label: '$1000+', min: 1000, max: Infinity, value: 0, color: '#8b5cf6' },
    ];

    products.forEach((p) => {
      const range = priceRanges.find((r) => p.price >= r.min && p.price < r.max);
      if (range) range.value++;
    });

    // Stock status for pie chart
    const stockData = [
      { label: 'In Stock', value: inStock, color: '#22c55e' },
      { label: 'Out of Stock', value: outOfStock, color: '#ef4444' },
    ];

    // Product types for pie chart
    const typeData = [
      { label: 'Single', value: singleProducts, color: '#3b82f6' },
      { label: 'Bundles', value: bundles, color: '#f59e0b' },
    ];

    return {
      total,
      inStock,
      outOfStock,
      featured,
      bundles,
      singleProducts,
      totalValue,
      avgPrice,
      categoryChart,
      priceRanges: priceRanges.filter((r) => r.value > 0),
      stockData,
      typeData,
    };
  }, [products]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Unauthorized</div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Analytics Dashboard</h1>
          <p className="text-sm text-zinc-500">Overview of your product catalog</p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Products', value: stats.total, color: 'bg-zinc-900' },
                { label: 'In Stock', value: stats.inStock, color: 'bg-green-500' },
                { label: 'Featured', value: stats.featured, color: 'bg-red-500' },
                { label: 'Avg Price', value: `$${stats.avgPrice.toFixed(0)}`, color: 'bg-blue-500' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Categories */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="font-semibold text-zinc-900 mb-4">Products by Category</h3>
                {stats.categoryChart.length > 0 ? (
                  <BarChart
                    data={stats.categoryChart}
                    maxValue={Math.max(...stats.categoryChart.map((d) => d.value), 1)}
                  />
                ) : (
                  <p className="text-sm text-zinc-500">No data available</p>
                )}
              </div>

              {/* Price Distribution */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="font-semibold text-zinc-900 mb-4">Price Distribution</h3>
                {stats.priceRanges.length > 0 ? (
                  <PieChart data={stats.priceRanges} />
                ) : (
                  <p className="text-sm text-zinc-500">No data available</p>
                )}
              </div>

              {/* Stock Status */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="font-semibold text-zinc-900 mb-4">Stock Status</h3>
                <PieChart data={stats.stockData} />
              </div>

              {/* Product Types */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="font-semibold text-zinc-900 mb-4">Product Types</h3>
                <PieChart data={stats.typeData} />
              </div>
            </div>

            {/* Summary Table */}
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-900">Catalog Summary</h3>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Total Value:</span>
                  <p className="font-semibold text-zinc-900">${stats.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Single Products:</span>
                  <p className="font-semibold text-zinc-900">{stats.singleProducts}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Bundles:</span>
                  <p className="font-semibold text-zinc-900">{stats.bundles}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Stock Rate:</span>
                  <p className="font-semibold text-zinc-900">
                    {stats.total > 0 ? ((stats.inStock / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
}
