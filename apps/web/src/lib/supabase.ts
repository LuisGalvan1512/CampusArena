import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wksydtbuvlwtbfsifthb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indrc3lkdGJ1dmx3dGJmc2lmdGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTk1OTAsImV4cCI6MjEwNzM5NTU5MH0.8vBo52SoEq8JUA3MM4lUE8aU1q7jawlT51ZC_N7kYFE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
