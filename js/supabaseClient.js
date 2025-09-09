import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function createSupabaseClient() {
  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  try {
    const cfg = await import('../config.js');
    SUPABASE_URL = cfg.SUPABASE_URL || '';
    SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY || '';
  } catch (e) {
    console.warn('config.js not found. Using empty Supabase config.');
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase config missing. Copy config.example.js to config.js and set keys.');
  }
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

