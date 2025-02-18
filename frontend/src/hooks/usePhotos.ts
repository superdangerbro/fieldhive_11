import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Photo = Database['public']['Tables']['photos']['Row'];

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIMIZATION_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1080,
  maxHeight: 1080,
  quality: 0.5,
  format: 'image/webp'
};

async function optimizeImage(file: File, options: ImageOptimizationOptions = DEFAULT_OPTIMIZATION_OPTIONS): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const maxWidth = options.maxWidth || width;
      const maxHeight = options.maxHeight || height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and optimize image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        options.format || 'image/webp',
        options.quality || 0.8
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function usePhotos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(async (
    file: File, 
    entityType: 'feature' | 'inspection',
    entityId: string,
    location?: { latitude: number; longitude: number },
    optimizationOptions?: ImageOptimizationOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Optimize image before upload
      const optimizedBlob = await optimizeImage(file, {
        ...DEFAULT_OPTIMIZATION_OPTIONS,
        ...optimizationOptions
      });

      // Create optimized file with original name but .webp extension
      const originalName = file.name.split('.')[0];
      const optimizedFile = new File(
        [optimizedBlob], 
        `${originalName}.webp`, 
        { type: 'image/webp' }
      );

      // Upload file to storage
      const fileName = `${crypto.randomUUID()}-${optimizedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('form_photos')
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('form_photos')
        .getPublicUrl(fileName);

      // Create photo record
      const { error: dbError, data: photo } = await supabase
        .from('photos')
        .insert({
          file_path: publicUrl,
          entity_type: entityType,
          entity_id: entityId,
          location: location ? {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          } : null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return photo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPhotos = useCallback(async (entityType: 'feature' | 'inspection', entityId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch photos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePhoto = useCallback(async (photo: Photo) => {
    setLoading(true);
    setError(null);

    try {
      // Delete file from storage
      const fileName = photo.file_path.split('/').pop();
      if (!fileName) throw new Error('Invalid file path');

      const { error: storageError } = await supabase.storage
        .from('form_photos')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete photo record
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadPhoto,
    fetchPhotos,
    deletePhoto,
    DEFAULT_OPTIMIZATION_OPTIONS
  };
} 