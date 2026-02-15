'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Warehouse, Store, Plus, Trash2, Home, Package, ShoppingCart, Settings, ArrowLeft } from 'lucide-react';

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'warehouse',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchLocations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });
    
    setLocations(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase.from('locations').insert([{
        ...formData,
        company_id: profile?.company_id,
      }]);

      if (error) throw error;

      setFormData({ name: '', address: '', type: 'warehouse' });
      setShowForm(false);
      fetchLocations();
      alert('Location added successfully!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"? This will also delete all inventory at this location.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchLocations();
      alert('Location deleted successfully!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Locations</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white p-2 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600">{locations.length} locations</p>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Manage Locations
              </h1>
              <p className="text-sm text-gray-600 mt-1">{locations.length} locations</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Location
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Add Location Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Location</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="e.g., Main Warehouse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="warehouse">Warehouse</option>
                    <option value="store">Store</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  placeholder="e.g., 123 Main St, Lagos"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Location Cards */}
        <div className="lg:hidden space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <Link
                href={`/locations/${location.id}`}
                className="block p-4 hover:bg-green-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${
                    location.type === 'warehouse' ? 'bg-blue-100' :
                    location.type === 'store' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {location.type === 'warehouse' ? (
                      <Warehouse className="w-6 h-6 text-blue-600" />
                    ) : location.type === 'store' ? (
                      <Store className="w-6 h-6 text-purple-600" />
                    ) : (
                      <MapPin className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{location.name}</h3>
                    {location.address && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{location.address}</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      location.type === 'warehouse' ? 'bg-blue-100 text-blue-800' :
                      location.type === 'store' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {location.type}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="border-t border-gray-100 p-3 bg-gray-50">
                <button
                  onClick={() => handleDelete(location.id, location.name)}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Location
                </button>
              </div>
            </div>
          ))}

          {locations.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No locations yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-green-600 hover:text-green-700 text-sm mt-2"
              >
                Add your first location
              </button>
            </div>
          )}
        </div>

        {/* Desktop Location Cards */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="group relative">
              <Link
                href={`/locations/${location.id}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${
                    location.type === 'warehouse' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                    location.type === 'store' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                    'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    {location.type === 'warehouse' ? (
                      <Warehouse className="w-8 h-8 text-blue-600" />
                    ) : location.type === 'store' ? (
                      <Store className="w-8 h-8 text-purple-600" />
                    ) : (
                      <MapPin className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    location.type === 'warehouse' ? 'bg-blue-100 text-blue-800' :
                    location.type === 'store' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {location.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{location.name}</h3>
                {location.address && (
                  <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </p>
                )}

                <div className="text-sm text-green-600 font-medium group-hover:text-green-700">
                  View products →
                </div>
              </Link>

              <button
                onClick={() => handleDelete(location.id, location.name)}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg border-2 border-gray-200 text-red-600 hover:text-red-800 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {locations.length === 0 && (
            <div className="col-span-full text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No locations yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block"
              >
                Add your first location
              </button>
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
