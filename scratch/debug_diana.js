const supabaseUrl = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

const response = await fetch(`${supabaseUrl}/rest/v1/profiles?full_name=ilike.*Diana*&select=id,full_name`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));