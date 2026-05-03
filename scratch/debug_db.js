import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debug() {
    const { data: academies } = await supabase.from('academies').select('*');
    console.log('Academies:', academies);
    
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5);
    console.log('Profiles:', profiles);
}

debug();
