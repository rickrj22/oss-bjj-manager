import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findDiana() {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email')
    .ilike('full_name', '%Diana%');
  
  console.log('Resultados:', data);
}

findDiana();