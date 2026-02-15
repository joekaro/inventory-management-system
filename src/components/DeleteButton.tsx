'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeleteButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteButton({ productId, productName }: DeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Product deleted successfully!');
      router.refresh();
    } catch (error: any) {
      alert('Error deleting product: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
