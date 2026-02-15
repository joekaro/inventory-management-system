'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface ProductQRCodeProps {
  productId: string;
  sku: string;
  name: string;
}

export default function ProductQRCode({ productId, sku, name }: ProductQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (showQR && canvasRef.current) {
      // Generate URL that opens the product edit page
      const productUrl = `${window.location.origin}/products/${productId}/edit`;
      
      QRCode.toCanvas(
        canvasRef.current,
        productUrl,
        { 
          width: 200, 
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      );
    }
  }, [showQR, productId]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${sku}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowQR(!showQR)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        {showQR ? 'Hide QR Code' : 'Show QR Code'}
      </button>

      {showQR && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600 mb-1">{name}</p>
            <p className="text-xs text-gray-500">SKU: {sku}</p>
          </div>
          <canvas ref={canvasRef} className="mx-auto mb-3" />
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-600">
              Scan to open product page
            </p>
            <button
              onClick={downloadQR}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
