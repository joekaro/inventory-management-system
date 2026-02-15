'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

interface StockAdjustmentProps {
  productId: string;
  productName: string;
  currentStock: number;
  locationId: string;
  locationName: string;
}

export default function StockAdjustment({
  productId,
  productName,
  currentStock,
  locationId,
  locationName,
}: StockAdjustmentProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

      const qty = parseInt(quantity);
      const newStock = type === 'add' ? currentStock + qty : currentStock - qty;

      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }

      await supabase
        .from('inventory')
        .update({ quantity: newStock })
        .eq('product_id', productId)
        .eq('location_id', locationId);

      await supabase.from('stock_movements').insert([{
        product_id: productId,
        location_id: locationId,
        type: type === 'add' ? 'IN' : 'OUT',
        quantity: qty,
        notes: notes || `Stock ${type === 'add' ? 'added' : 'removed'} via adjustment`,
      }]);

      // Log activity
      await supabase.from('activity_logs').insert([{
        company_id: profile?.company_id,
        user_id: user?.id,
        action: 'STOCK_ADJUSTED',
        entity_type: 'inventory',
        entity_id: productId,
        details: `${type === 'add' ? 'Added' : 'Removed'} ${qty} units of ${productName} at ${locationName}`
      }]);

      alert('Stock adjusted successfully!');
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Edit className="w-4 h-4" />
        Adjust
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Adjust Stock</h3>
              <p className="text-sm text-gray-600 mt-1">
                {productName} at {locationName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Current stock: <span className="font-semibold">{currentStock}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Action *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType('add')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      type === 'add'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('remove')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      type === 'remove'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Remove Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Reason for adjustment..."
                />
              </div>

              {quantity && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    New stock level:{' '}
                    <span className="font-semibold">
                      {type === 'add'
                        ? currentStock + parseInt(quantity)
                        : currentStock - parseInt(quantity)}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
