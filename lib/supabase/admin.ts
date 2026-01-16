// ============================================================================
// SUPABASE ADMIN CLIENT
// Service role for RLS bypass - SERVER-SIDE ONLY
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // Fallback to anon key if service role not available
  // Some operations will fail due to RLS, but basic functionality works
  console.warn('[SUPABASE ADMIN] Service role key not found, using anon key as fallback');
  supabaseAdmin = createClient(
    supabaseUrl || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export { supabaseAdmin };
