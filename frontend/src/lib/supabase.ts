import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'FieldHive'
    }
  }
});

// Initialize real-time subscriptions
export const channels = {
  schema: supabase.channel('schema_changes'),
  sections: supabase.channel('sections_changes'),
  featureTypes: supabase.channel('feature_types_changes')
};

// Export storage buckets
export const storage = {
  icons: supabase.storage.from('icons'),
  floorPlans: supabase.storage.from('floor_plans'),
  photos: supabase.storage.from('form_photos')
};