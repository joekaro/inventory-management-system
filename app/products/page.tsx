'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Package, Home, ShoppingCart, Settings, Plus, Search, Filter } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import ProductsFilter from '@/components/ProductsFilter';
import ExportButton from '@/components/ExportButton';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchProducts = async () => {
    let query = supabase.from("products").select("*");

    const search = searchParams.get('search');
    const category = searchParams.get('category');

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`name.ilike.${searchTerm},sku.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data } = await query.order("created_at", { ascending: false });
    setProducts(data || []);

    const { data: allProducts } = await supabase.from("products").select("category");
    const cats = [...new Set(allProducts?.map((p) => p.category).filter(Boolean))] as string[];
    setCategories(cats);
    
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <div className="flex items-center gap-2">
            <ExportButton products={products} />
            <Link
              href="/products/new"
              className="bg-blue-600 text-white p-2 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-600">{products.length} products</p>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-sm text-gray-600 mt-1">{products.length} total products</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton products={products} />
              <Link
                href="/products/new"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Filter - Both Mobile & Desktop */}
        <div className="mb-4">
          <ProductsFilter categories={categories} />
        </div>

        {/* Mobile Product Cards */}
        <div className="lg:hidden space-y-3">
          {products.map((product) => {
            const margin = product.selling_price && product.cost_price
              ? (((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1)
              : 0;

            return (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{product.sku}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category || "N/A"}
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        parseFloat(margin.toString()) > 30 ? "bg-green-100 text-green-700" :
                        parseFloat(margin.toString()) > 15 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {margin}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-gray-900">₦{product.selling_price?.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/products/${product.id}/edit`} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton productId={product.id} productName={product.name} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products found</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Margin</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => {
                  const margin = product.selling_price && product.cost_price
                    ? (((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-xl shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                            <Package className="w-7 h-7 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                          {product.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        ₦{product.cost_price?.toLocaleString() || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₦{product.selling_price?.toLocaleString() || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                          parseFloat(margin.toString()) > 30 ? "bg-green-100 text-green-700" :
                          parseFloat(margin.toString()) > 15 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <DeleteButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <Link href="/products/new" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                Add your first product
              </Link>
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
          <Link href="/products" className="flex flex-col items-center justify-center py-3 text-blue-600 bg-blue-50">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Products</span>
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
