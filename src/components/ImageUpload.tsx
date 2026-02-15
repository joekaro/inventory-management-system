'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  productId?: string;
}

export default function ImageUpload({ currentImage, onImageUploaded, productId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${productId || Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onImageUploaded(data.publicUrl);
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      uploadImage(file);
    }
  };

  const removeImage = () => {
    setPreview('');
    onImageUploaded('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Product Image</label>
      
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Product"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-2">Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}
