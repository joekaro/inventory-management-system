'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (sku: string) => void;
}

export default function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    setIsScanning(true);
    
    try {
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div>
      {!isScanning ? (
        <button
          type="button"
          onClick={startScanning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Camera className="w-4 h-4" />
          Scan Barcode
        </button>
      ) : (
        <div className="relative">
          <div id="reader" className="w-full max-w-sm mx-auto"></div>
          <button
            onClick={stopScanning}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mx-auto"
          >
            <X className="w-4 h-4" />
            Stop Scanning
          </button>
        </div>
      )}
    </div>
  );
}
