import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Debug: Log environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Whiskey {
  id: string;
  name: string;
  brand: string;
  distillery: string;
  type: string;
  region: string;
  age?: number;
  abv?: number;
  description?: string;
  image_url?: string;
  barcode?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  whiskey_id: string;
  rating: number;
  tasting_notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  preferences?: {
    favorite_regions?: string[];
    favorite_types?: string[];
  };
  created_at: string;
  updated_at: string;
}
