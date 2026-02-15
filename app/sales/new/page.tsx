'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function NewSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    quantity: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'cash',
    notes: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: locData } = await supabase.from('locations').select('*');
    setProducts(prodData || []);
    setLocations(locData || []);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setFormData({ ...formData, product_id: productId });
  };

  const handleScanSuccess = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      setSelectedProduct(product);
      setFormData({ ...formData, product_id: product.id });
      alert(`Product found: ${product.name}`);
    } else {
      alert('Product not found with SKU: ' + sku);
    }
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

      const qty = parseInt(formData.quantity);
      const unitPrice = selectedProduct?.selling_price || 0;
      const totalAmount = qty * unitPrice;

      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', formData.product_id)
        .eq('location_id', formData.location_id)
        .single();

      if (!inventory || inventory.quantity < qty) {
        throw new Error('Insufficient stock');
      }

      const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
        ...formData,
        company_id: profile?.company_id,
        quantity: qty,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'completed',
        created_by: user?.id,
      }]).select().single();

      if (saleError) throw saleError;

      await supabase
        .from('inventory')
        .update({ quantity: inventory.quantity - qty })
        .eq('product_id', formData.product_id)
        .eq('location_id', formData.location_id);

      await supabase.from('stock_movements').insert([{
        product_id: formData.product_id,
        location_id: formData.location_id,
        type: 'OUT',
        quantity: qty,
        notes: `Sale to ${formData.customer_name || 'customer'}`,
      }]);

      // Log activity - DIRECT INSERT
      await supabase.from('activity_logs').insert([{
        company_id: profile?.company_id,
        user_id: user?.id,
        action: 'SALE_CREATED',
        entity_type: 'sale',
        entity_id: saleData.id,
        details: `Sale: ${qty}x ${selectedProduct?.name} for ₦${totalAmount.toLocaleString()}`
      }]);

      alert('Sale recorded successfully!');
      router.push('/sales');
    } catch (error: any) {
      console.error('Sale error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedProduct 
    ? (parseInt(formData.quantity) || 0) * selectedProduct.selling_price 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/sales" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
            ← Back to Sales
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Record New Sale</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Product *</label>
              <select
                value={formData.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₦{product.selling_price?.toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <BarcodeScanner onScanSuccess={handleScanSuccess} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>
            </div>

            {selectedProduct && formData.quantity && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Unit Price: <span className="font-semibold">₦{selectedProduct.selling_price.toLocaleString()}</span>
                </p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  Total: ₦{totalAmount.toLocaleString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="mobile">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
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
                {loading ? 'Recording...' : 'Record Sale'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
