'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Package, AlertTriangle, Download, Home, ShoppingCart, Settings, Plus, Info } from 'lucide-react';
import StockAdjustment from '@/components/StockAdjustment';
import TransferStock from '@/components/TransferStock';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: invData } = await supabase
      .from('inventory')
      .select('*, products(id, name, sku, reorder_point), locations(id, name)')
      .order('updated_at', { ascending: false });
    
    setInventory(invData || []);

    const { data: movData } = await supabase
      .from('stock_movements')
      .select('*, products(name, sku), locations(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    setMovements(movData || []);
  };

  const exportToCSV = () => {
    const csvData = inventory.map(item => ({
      Product: item.products?.name,
      SKU: item.products?.sku,
      Location: item.locations?.name,
      'Available Quantity': item.quantity - (item.reserved_quantity || 0),
      'Reserved Quantity': item.reserved_quantity || 0,
      'Total Quantity': item.quantity,
      'Reorder Point': item.products?.reorder_point || 'N/A',
      Status: (item.products?.reorder_point && (item.quantity - (item.reserved_quantity || 0)) < item.products.reorder_point) ? 'Low Stock' : 'In Stock'
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
            <button onClick={exportToCSV} className="text-gray-600 p-2">
              <Download className="w-5 h-5" />
            </button>
          </div>
          {/* Mobile Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Stock Levels
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'movements'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Movements
            </button>
          </div>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Inventory & Stock Movements
              </h1>
              <p className="text-sm text-gray-600 mt-1">{inventory.length} inventory items</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8 space-y-4 lg:space-y-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm mb-1">How Low Stock Works</h3>
              <p className="text-xs text-blue-800">
                Each product has a <span className="font-bold">Reorder Point</span>. When available stock falls below this number, it shows as "Low Stock". 
                Different products can have different reorder points based on their importance.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Inventory Cards */}
        {activeTab === 'inventory' && (
          <div className="lg:hidden space-y-3">
            {inventory.map((item) => {
              const available = item.quantity - (item.reserved_quantity || 0);
              const reorderPoint = item.products?.reorder_point || 0;
              const isLow = reorderPoint > 0 && available < reorderPoint;
              
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.products?.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{item.products?.sku}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.locations?.name}</p>
                    </div>
                    {isLow ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Low
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        OK
                      </span>
                    )}
                  </div>

                  {/* Reorder Point Info */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Reorder Point:</span>
                      <span className="font-bold text-gray-900">
                        {reorderPoint > 0 ? `${reorderPoint} units` : 'Not set'}
                      </span>
                    </div>
                    {reorderPoint > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {available < reorderPoint 
                          ? `⚠️ ${reorderPoint - available} units below reorder point` 
                          : `✓ ${available - reorderPoint} units above reorder point`}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Available</p>
                      <p className={`text-xl font-bold ${
                        available > 10 ? 'text-green-600' : 
                        available > 0 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>{available}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Reserved</p>
                      <p className="text-xl font-bold text-gray-900">{item.reserved_quantity || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-xl font-bold text-gray-900">{item.quantity}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <StockAdjustment
                        productId={item.product_id}
                        productName={item.products?.name}
                        currentStock={item.quantity}
                        locationId={item.location_id}
                        locationName={item.locations?.name}
                      />
                    </div>
                    <div className="flex-1">
                      <TransferStock
                        productId={item.product_id}
                        productName={item.products?.name}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {inventory.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No inventory data</p>
              </div>
            )}
          </div>
        )}

        {/* Mobile Movements Cards */}
        {activeTab === 'movements' && (
          <div className="lg:hidden space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{movement.products?.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{movement.products?.sku}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                    movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {movement.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{movement.locations?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-bold text-gray-900">{movement.quantity}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{new Date(movement.created_at).toLocaleString()}</p>
                  </div>
                  {movement.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Notes</p>
                      <p className="text-gray-900">{movement.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {movements.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500">No movements found</p>
              </div>
            )}
          </div>
        )}

        {/* Desktop Current Inventory */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Stock Levels</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reserved</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reorder Point</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {inventory.map((item) => {
                  const available = item.quantity - (item.reserved_quantity || 0);
                  const reorderPoint = item.products?.reorder_point || 0;
                  const isLow = reorderPoint > 0 && available < reorderPoint;
                  
                  return (
                    <tr key={item.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{item.products?.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{item.products?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.locations?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                          available > 10 ? 'text-green-600 bg-green-100' : 
                          available > 0 ? 'text-yellow-600 bg-yellow-100' : 
                          'text-red-600 bg-red-100'
                        }`}>
                          {available}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.reserved_quantity || 0}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {reorderPoint > 0 ? `${reorderPoint} units` : 'Not set'}
                        </div>
                        {reorderPoint > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {available < reorderPoint 
                              ? `${reorderPoint - available} below` 
                              : `${available - reorderPoint} above`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            <Package className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StockAdjustment
                            productId={item.product_id}
                            productName={item.products?.name}
                            currentStock={item.quantity}
                            locationId={item.location_id}
                            locationName={item.locations?.name}
                          />
                          <TransferStock
                            productId={item.product_id}
                            productName={item.products?.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inventory.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No inventory data found</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Stock Movements */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Stock Movements</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-green-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{movement.products?.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{movement.products?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.locations?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                        movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                        movement.type === 'TRANSFER' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{movement.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{movement.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg font-medium">No stock movements found</p>
              </div>
            )}
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
