import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { supabase } from '../lib/supabase';
import {
  sectionAdded,
  sectionUpdated,
  sectionDeleted,
  mapFeatureTypeAdded,
  mapFeatureTypeUpdated,
  mapFeatureTypeDeleted,
} from '../store/slices/schemaSlice';
import type { Database } from '../types/supabase';

export function useSchemaSubscription() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Subscribe to sections changes
    const sectionsSubscription = supabase
      .channel('sections_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sections',
        },
        (payload) => {
          dispatch(sectionAdded(payload.new as Database['public']['Tables']['sections']['Row']));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sections',
        },
        (payload) => {
          dispatch(sectionUpdated(payload.new as Database['public']['Tables']['sections']['Row']));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sections',
        },
        (payload) => {
          dispatch(sectionDeleted(payload.old.id));
        }
      )
      .subscribe();

    // Subscribe to map feature types changes
    const featureTypesSubscription = supabase
      .channel('feature_types_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'map_feature_types',
        },
        (payload) => {
          dispatch(mapFeatureTypeAdded(payload.new as Database['public']['Tables']['map_feature_types']['Row']));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'map_feature_types',
        },
        (payload) => {
          dispatch(mapFeatureTypeUpdated(payload.new as Database['public']['Tables']['map_feature_types']['Row']));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'map_feature_types',
        },
        (payload) => {
          dispatch(mapFeatureTypeDeleted(payload.old.id));
        }
      )
      .subscribe();

    return () => {
      sectionsSubscription.unsubscribe();
      featureTypesSubscription.unsubscribe();
    };
  }, [dispatch]);
} 