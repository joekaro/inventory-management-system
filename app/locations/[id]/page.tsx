'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Package, ArrowLeft, Home, ShoppingCart, Settings, Plus, AlertTriangle } from 'lucide-react';
import StockAdjustment from '@/components/StockAdjustment';

export default function LocationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    // Fetch location details
    const { data: locationData } = await supabase
      .from('locations')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!locationData) {
      router.push('/locations');
      return;
    }

    setLocation(locationData);

    // Fetch inventory at this location
    const { data: invData } = await supabase
      .from('inventory')
      .select('*, products(*)')
      .eq('location_id', params.id)
      .order('updated_at', { ascending: false });

    setInventory(invData || []);

    // Calculate stats
    const totalValue = (invData || []).reduce((sum, item) => {
      return sum + (item.quantity * (item.products?.selling_price || 0));
    }, 0);

    const lowStock = (invData || []).filter(item => {
      const available = item.quantity - (item.reserved_quantity || 0);
      return item.products?.reorder_point && available < item.products.reorder_point;
    }).length;

    setStats({
      totalProducts: invData?.length || 0,
      totalValue,
      lowStock,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <Link href="/locations" className="text-blue-600 text-sm mb-2 inline-block">
          ← Back to Locations
        </Link>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{location?.name}</h1>
            <p className="text-xs text-gray-600">{location?.address || 'No address'}</p>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/locations" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Locations
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg shadow-green-500/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {location?.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{location?.address || 'No address'}</p>
              <span className="inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">
                {location?.type || 'warehouse'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="text-center lg:flex lg:items-center lg:justify-between lg:text-left">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Products</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1 lg:mt-2">{stats.totalProducts}</p>
              </div>
              <div className="hidden lg:block bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="text-center lg:flex lg:items-center lg:justify-between lg:text-left">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Value</p>
                <p className="text-lg lg:text-3xl font-bold text-green-600 mt-1 lg:mt-2">
                  ₦{(stats.totalValue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="text-center lg:flex lg:items-center lg:justify-between lg:text-left">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-xl lg:text-3xl font-bold text-red-600 mt-1 lg:mt-2">{stats.lowStock}</p>
              </div>
              <div className="hidden lg:block bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Product Cards */}
        <div className="lg:hidden space-y-3">
          {inventory.map((item) => {
            const available = item.quantity - (item.reserved_quantity || 0);
            const isLow = item.products?.reorder_point && available < item.products.reorder_point;

            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-3 mb-3">
                  {item.products?.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.products?.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{item.products?.sku}</p>
                    {isLow && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 mt-2 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className={`text-lg font-bold ${
                      available > 10 ? 'text-green-600' : 
                      available > 0 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>{available}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reserved</p>
                    <p className="text-lg font-bold text-gray-900">{item.reserved_quantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{item.quantity}</p>
                  </div>
                </div>

                <StockAdjustment
                  productId={item.product_id}
                  productName={item.products?.name}
                  currentStock={item.quantity}
                  locationId={item.location_id}
                  locationName={location?.name}
                />
              </div>
            );
          })}

          {inventory.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products at this location</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-green-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Available</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {inventory.map((item) => {
                const available = item.quantity - (item.reserved_quantity || 0);
                const isLow = item.products?.reorder_point && available < item.products.reorder_point;

                return (
                  <tr key={item.id} className="hover:bg-green-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-12 h-12 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.products?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {item.products?.sku}
                      </span>
                    </td>
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
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.quantity}</td>
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
                      <StockAdjustment
                        productId={item.product_id}
                        productName={item.products?.name}
                        currentStock={item.quantity}
                        locationId={item.location_id}
                        locationName={location?.name}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products at this location</p>
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
