const SUPABASE_URL = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

async function patch(table, oldVal, newVal, column) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(oldVal)}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ [column]: newVal })
    });
    if (!res.ok) {
        const err = await res.text();
        console.error(`❌ Error updating ${table} (${oldVal} -> ${newVal}):`, err);
    } else {
        console.log(`✅ Updated ${table}: ${oldVal} -> ${newVal}`);
    }
}

async function migrate() {
    console.log("🚀 Iniciando migração via REST API...");

    const mapping = {
        'branca': 'white belt',
        'azul': 'blue belt',
        'roxa': 'purple belt',
        'marrom': 'brown belt',
        'preta': 'black belt'
    };

    for (const [oldBelt, newBelt] of Object.entries(mapping)) {
        await patch('profiles', oldBelt, newBelt, 'current_belt');
        await patch('graduation_history', oldBelt, newBelt, 'belt_to');
        await patch('graduation_history', oldBelt, newBelt, 'belt_from');
    }

    console.log("🏁 Migração concluída!");
}

migrate();
