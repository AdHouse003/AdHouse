import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://azcmvwhphaysgekjwipt.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y212d2hwaGF5c2dla2p3aXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNTQ4NzUsImV4cCI6MjA0NzczMDg3NX0.WuJEM-iBKy0KuTLid416EarNCjcMellOMBvmblkneXM'; // Replace with your Supabase public anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
