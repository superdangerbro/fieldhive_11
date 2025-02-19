/// <reference types="vite/client" />

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

// Auth helper functions
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: () => supabase.auth.getSession(),
  
  onAuthStateChange: (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void) => 
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event as 'SIGNED_IN' | 'SIGNED_OUT', session);
    }),
};