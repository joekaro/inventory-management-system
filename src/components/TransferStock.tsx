'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft } from 'lucide-react';

interface TransferStockProps {
  productId: string;
  productName: string;
}

export default function TransferStock({ productId, productName }: TransferStockProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = async () => {
    const { data } = await supabase.from('locations').select('*');
    setLocations(data || []);
    setIsOpen(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const qtyNum = parseInt(quantity);

      // 1. Deduct from source location
      const { data: fromInv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .eq('location_id', fromLocation)
        .single();

      if (!fromInv || fromInv.quantity < qtyNum) {
        throw new Error('Insufficient stock at source location');
      }

      await supabase
        .from('inventory')
        .update({ quantity: fromInv.quantity - qtyNum })
        .eq('product_id', productId)
        .eq('location_id', fromLocation);

      // 2. Add to destination location
      const { data: toInv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .eq('location_id', toLocation)
        .single();

      if (toInv) {
        await supabase
          .from('inventory')
          .update({ quantity: toInv.quantity + qtyNum })
          .eq('product_id', productId)
          .eq('location_id', toLocation);
      } else {
        await supabase.from('inventory').insert({
          product_id: productId,
          location_id: toLocation,
          quantity: qtyNum,
        });
      }

      // 3. Record movements
      await supabase.from('stock_movements').insert([
        {
          product_id: productId,
          location_id: fromLocation,
          type: 'OUT',
          quantity: qtyNum,
          notes: `Transfer to another location: ${notes}`,
        },
        {
          product_id: productId,
          location_id: toLocation,
          type: 'IN',
          quantity: qtyNum,
          notes: `Transfer from another location: ${notes}`,
        },
      ]);

      alert('Stock transferred successfully!');
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
        onClick={openModal}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        <ArrowRightLeft className="w-4 h-4" />
        Transfer
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Transfer Stock</h3>
              <p className="text-sm text-gray-600 mt-1">{productName}</p>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Location *</label>
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select source location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To Location *</label>
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select destination location</option>
                  {locations.filter(l => l.id !== fromLocation).map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
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
                  placeholder="Reason for transfer..."
                />
              </div>

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
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Transferring...' : 'Transfer Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
