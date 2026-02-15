'use client';

import { QRCodeSVG } from 'qrcode.react';

interface ProductQRCodeProps {
  productId: string;
  productName: string;
  sku: string;
}

export default function ProductQRCode({ productId, productName, sku }: ProductQRCodeProps) {
  const qrValue = JSON.stringify({
    id: productId,
    name: productName,
    sku: sku,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG
        value={qrValue}
        size={200}
        level="H"
        includeMargin={true}
      />
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">{productName}</p>
        <p className="text-xs text-gray-500 font-mono">{sku}</p>
      </div>
    </div>
  );
}
