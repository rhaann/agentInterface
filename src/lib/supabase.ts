import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- ADD THESE CHECKS ---
if (!supabaseUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not set.");
}

if (!supabaseAnonKey) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
}
// --- END CHECKS ---

// Now TypeScript knows supabaseUrl and supabaseAnonKey MUST be strings here
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});