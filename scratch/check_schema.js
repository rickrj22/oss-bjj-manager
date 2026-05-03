const SUPABASE_URL = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

async function check() {
    // Try to get one record from graduation_history
    const res = await fetch(`${SUPABASE_URL}/rest/v1/graduation_history?limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const data = await res.json();
    if (data.length > 0) {
        console.log("Graduation History Schema Columns:", Object.keys(data[0]));
    } else {
        console.log("No records in graduation_history to check columns.");
        // Try to get column names via explain or something? 
        // Best is to try a dummy select with common names
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/graduation_history?select=belt,belt_to,stripes,stripes_to&limit=0`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const err = await res2.json();
        console.log("Schema Hint via Error:", err.message);
    }
}

check();
