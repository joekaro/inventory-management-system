'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductQRCode from '@/components/ProductQRCode';

export default function ProductDetailsPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    setProduct(productData);

    const { data: invData } = await supabase
      .from('inventory')
      .select('*, locations(name)')
      .eq('product_id', params.id);

    setInventory(invData || []);
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
            ← Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Product Information</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">SKU</dt>
                  <dd className="text-sm text-gray-900 mt-1">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900 mt-1">{product.category || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cost Price</dt>
                  <dd className="text-sm text-gray-900 mt-1">₦{product.cost_price?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Selling Price</dt>
                  <dd className="text-sm text-gray-900 mt-1">₦{product.selling_price?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Stock</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-semibold">{totalStock} units</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reorder Point</dt>
                  <dd className="text-sm text-gray-900 mt-1">{product.reorder_point || 'Not set'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900 mt-1">{product.description || 'No description'}</dd>
                </div>
              </dl>
            </div>

            {/* Stock by Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Stock by Location</h2>
              <div className="space-y-3">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.locations?.name}</span>
                    <span className="text-sm text-gray-900">{item.quantity} units</span>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-gray-500 text-sm">No stock at any location</p>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Product QR Code</h2>
              <ProductQRCode 
                productId={product.id}
                productName={product.name}
                sku={product.sku}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
