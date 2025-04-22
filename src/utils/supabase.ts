
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if the connection is working
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('crawl_sessions').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}
