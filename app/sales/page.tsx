'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingCart, Plus, Download, Home, Package, Settings } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*, products(name, sku), locations(name)')
      .order('created_at', { ascending: false });

    setSales(data || []);

    const total = (data || []).reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const today = new Date().toDateString();
    const todayTotal = (data || [])
      .filter(sale => new Date(sale.created_at).toDateString() === today)
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    setStats({
      totalSales: data?.length || 0,
      totalRevenue: total,
      todayRevenue: todayTotal,
    });
  };

  const exportToCSV = () => {
    const csvData = sales.map(sale => ({
      Date: new Date(sale.created_at).toLocaleString(),
      Product: sale.products?.name,
      SKU: sale.products?.sku,
      Quantity: sale.quantity,
      'Unit Price': sale.unit_price,
      Total: sale.total_amount,
      Customer: sale.customer_name || 'N/A',
      Payment: sale.payment_method || 'N/A'
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Sales</h1>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="text-gray-600 p-2">
              <Download className="w-5 h-5" />
            </button>
            <Link href="/sales/new" className="bg-purple-600 text-white p-2 rounded-xl">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-600">{stats.totalSales} sales</p>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sales & Orders
              </h1>
              <p className="text-sm text-gray-600 mt-1">{stats.totalSales} total sales</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                href="/sales/new"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Sale
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Mobile Stats - 3 cards */}
        <div className="lg:hidden grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Total Sales</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalSales}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Revenue</p>
            <p className="text-lg font-bold text-green-600">₦{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Today</p>
            <p className="text-lg font-bold text-blue-600">₦{(stats.todayRevenue / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Desktop Stats */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSales}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₦{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₦{stats.todayRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sales Cards */}
        <div className="lg:hidden space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{sale.products?.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{sale.products?.sku}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">₦{parseFloat(sale.total_amount).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{sale.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900">{sale.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                    {sale.payment_method || 'Cash'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {sales.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sales yet</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{sale.products?.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{sale.products?.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.customer_name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.quantity}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ₦{parseFloat(sale.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                      {sale.payment_method || 'Cash'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No sales recorded yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">Products</span>
          </Link>
          <Link href="/products/new" className="flex flex-col items-center justify-center py-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-2xl shadow-lg -mt-6">
              <Plus className="w-6 h-6" />
            </div>
          </Link>
          <Link href="/sales" className="flex flex-col items-center justify-center py-3 text-purple-600 bg-purple-50">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Sales</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
