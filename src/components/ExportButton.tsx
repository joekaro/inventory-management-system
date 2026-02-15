'use client';

import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

interface ExportButtonProps {
  products: any[];
}

export default function ExportButton({ products }: ExportButtonProps) {
  const handleExport = () => {
    const exportData = products.map(p => ({
      Name: p.name,
      SKU: p.sku,
      Description: p.description || '',
      Category: p.category || '',
      'Cost Price': p.cost_price,
      'Selling Price': p.selling_price,
      'Reorder Point': p.reorder_point,
      'Created At': new Date(p.created_at).toLocaleDateString(),
    }));

    exportToCSV(exportData, 'products');
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
