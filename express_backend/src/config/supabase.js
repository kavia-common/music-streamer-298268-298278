const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required but not defined in environment variables');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('SUPABASE_KEY is required but not defined in environment variables');
}

// PUBLIC_INTERFACE
/**
 * Creates and returns a Supabase client instance configured with server-side credentials.
 * This client should only be used on the backend and never exposed to the frontend.
 * 
 * @returns {import('@supabase/supabase-js').SupabaseClient} Configured Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

module.exports = {
  getSupabaseClient
};
