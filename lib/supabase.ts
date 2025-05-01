import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzocyiasvqfdbqiwcybi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b2N5aWFzdnFmZGJxaXdjeWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjUyMDEsImV4cCI6MjA2MTUwMTIwMX0.DXjpf2aTkQo-_e7hQdHtPdKFtgH_AcKEYgphTapICxw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
}); 