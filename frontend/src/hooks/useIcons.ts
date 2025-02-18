import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Icon = Database['public']['Tables']['icons']['Row'];

export function useIcons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadIcon = useCallback(async (file: File, name: string, category?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Upload file to storage
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('icons')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('icons')
        .getPublicUrl(fileName);

      // Create icon record
      const { error: dbError, data: icon } = await supabase
        .from('icons')
        .insert({
          name,
          category: category || null,
          file_path: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return icon;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload icon';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIcons = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('icons').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch icons';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIcon = useCallback(async (icon: Icon) => {
    setLoading(true);
    setError(null);

    try {
      // Delete file from storage
      const fileName = icon.file_path.split('/').pop();
      if (!fileName) throw new Error('Invalid file path');

      const { error: storageError } = await supabase.storage
        .from('icons')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete icon record
      const { error: dbError } = await supabase
        .from('icons')
        .delete()
        .eq('id', icon.id);

      if (dbError) throw dbError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete icon';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadIcon,
    fetchIcons,
    deleteIcon,
  };
} 