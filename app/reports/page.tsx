'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { TrendingUp, Package, DollarSign, Download, FileText, Home, ShoppingCart, Settings, Plus } from 'lucide-react';

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    totalRetailValue: 0,
    potentialProfit: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: invData } = await supabase
      .from('inventory')
      .select('*, products(*)');
    const { data: movData } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    setProducts(prodData || []);
    setInventory(invData || []);
    setMovements(movData || []);

    const totalInvValue = (invData || []).reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.cost_price || 0));
    }, 0);

    const totalRetValue = (invData || []).reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.selling_price || 0));
    }, 0);

    setStats({
      totalInventoryValue: totalInvValue,
      totalRetailValue: totalRetValue,
      potentialProfit: totalRetValue - totalInvValue,
    });
  };

  const categoryBreakdown = products.reduce((acc: any, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) {
      acc[cat] = { count: 0, value: 0 };
    }
    acc[cat].count += 1;
    acc[cat].value += product.selling_price || 0;
    return acc;
  }, {});

  const topProducts = [...products]
    .sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0))
    .slice(0, 10);

  const exportToCSV = () => {
    const csvData = products.map(p => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category || 'N/A',
      'Cost Price': p.cost_price || 0,
      'Selling Price': p.selling_price || 0,
      'Reorder Point': p.reorder_point || 0
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportMovementsToCSV = () => {
    const csvData = movements.map(m => ({
      Date: new Date(m.created_at).toLocaleString(),
      'Product ID': m.product_id,
      'Location ID': m.location_id,
      Type: m.type,
      Quantity: m.quantity,
      Notes: m.notes || ''
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <button onClick={exportToCSV} className="text-gray-600 p-2">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export Products
              </button>
              <button
                onClick={exportMovementsToCSV}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <FileText className="w-4 h-4" />
                Export Movements
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8 space-y-4 lg:space-y-8">
        {/* Mobile Key Metrics - 3 cards */}
        <div className="lg:hidden grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Cost</p>
            <p className="text-lg font-bold text-gray-900">₦{(stats.totalInventoryValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Retail</p>
            <p className="text-lg font-bold text-green-600">₦{(stats.totalRetailValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-600 mb-1">Profit</p>
            <p className="text-lg font-bold text-purple-600">₦{(stats.potentialProfit / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Desktop Key Metrics */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value (Cost)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₦{stats.totalInventoryValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retail Value</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₦{stats.totalRetailValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg shadow-green-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Profit</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ₦{stats.potentialProfit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalInventoryValue > 0 
                    ? `${((stats.potentialProfit / stats.totalInventoryValue) * 100).toFixed(1)}% margin`
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Category Breakdown - Compact */}
        <div className="lg:hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Categories</h2>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).slice(0, 5).map(([category, data]: [string, any]) => (
              <div key={category} className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-900">{category}</span>
                <div className="text-right">
                  <span className="text-xs text-gray-500">{data.count} items</span>
                  <p className="font-semibold text-gray-900">₦{Math.round(data.value / data.count).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Category Breakdown */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => (
                  <tr key={category} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{category}</td>
                    <td className="py-3 px-4">{data.count}</td>
                    <td className="py-3 px-4">₦{Math.round(data.value / data.count).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Top Products - Compact */}
        <div className="lg:hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Top Products</h2>
          <div className="space-y-2">
            {topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex justify-between items-center text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                </div>
                <p className="font-bold text-gray-900 ml-2">₦{product.selling_price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Top Products */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Top 10 Products by Price</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{product.sku}</td>
                    <td className="py-3 px-4 font-bold">₦{product.selling_price?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <Link href="/sales" className="flex flex-col items-center justify-center py-3 text-gray-600 active:bg-gray-50">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Sales</span>
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
