import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxqwztaccmdnpotcfeev.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cXd6dGFjY21kbnBvdGNmZWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjg2MzUsImV4cCI6MjEwMzgwNDYzNX0.7msCflVq-FhHw9XrV52MCg3p8QDvwDX57leK5NsHifk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
