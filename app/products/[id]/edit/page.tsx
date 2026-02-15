'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    cost_price: '',
    selling_price: '',
    reorder_point: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) {
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        category: data.category || '',
        cost_price: data.cost_price?.toString() || '',
        selling_price: data.selling_price?.toString() || '',
        reorder_point: data.reorder_point?.toString() || '',
        image_url: data.image_url || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          cost_price: parseFloat(formData.cost_price) || 0,
          selling_price: parseFloat(formData.selling_price) || 0,
          reorder_point: parseInt(formData.reorder_point) || 0,
        })
        .eq('id', params.id);

      if (error) throw error;

      alert('Product updated successfully!');
      router.push('/products');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
            ← Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              currentImage={formData.image_url}
              productId={params.id as string}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reorder Point</label>
                <input
                  type="number"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price (₦) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Selling Price (₦) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
