'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface MediaUploaderProps {
  bucket: string;
  path: string;
  defaultValue?: string;
  label: string;
  aspectRatio?: 'square' | 'video' | 'wide'; // square (1:1), video (9:16), wide (16:9)
  onUploadComplete: (url: string | null) => void;
}

export function MediaUploader({ 
  bucket, 
  path, 
  defaultValue, 
  label, 
  aspectRatio = 'square',
  onUploadComplete 
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState<string | null>(defaultValue || null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setValue(publicUrl);
      onUploadComplete(publicUrl);
      toast.success('Image uploaded successfully');

    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setValue(null);
    onUploadComplete(null);
  };

  // Aspect Ratio Classes
  const ratioClasses = {
    square: 'aspect-square',
    video: 'aspect-[9/16]',
    wide: 'aspect-video'
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      
      {value ? (
        <div className={`relative group w-full ${ratioClasses[aspectRatio]} bg-slate-100 rounded-xl overflow-hidden border border-slate-200`}>
          <Image 
            src={value} 
            alt={label} 
            fill 
            className="object-cover"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className={`relative w-full ${ratioClasses[aspectRatio]} bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:bg-slate-100 transition-colors`}>
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
}
