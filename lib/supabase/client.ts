// Supabase Client Configuration
// Proyon - Proje Yönetim Platformu

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables - .env.local dosyasından gelir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase client oluştur
// Type-safe client with database types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function: Kullanıcı oturum kontrolü
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  
  return user;
}

// Helper function: Kullanıcı profili getir
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting profile:', error.message);
    return null;
  }
  
  return data;
}

// Helper function: Aktif kullanıcının profili
export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return getUserProfile(user.id);
}

// Export types for use in components
export type { Database };

// TODO: Supabase'i kullanmak için:
// 1. npm install @supabase/supabase-js
// 2. .env.local dosyası oluştur:
//    NEXT_PUBLIC_SUPABASE_URL=your-project-url
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// 3. Yukarıdaki import satırlarını uncomment et
