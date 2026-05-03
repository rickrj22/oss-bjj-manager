import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulmyuxxsfxsbvpnvideh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbXl1eHhzZnhzYnZwbnZpZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU3MjgsImV4cCI6MjA5MjAwMTcyOH0.Gjd49tUkBv-s7cBEm2o6d4YLDms75SihFeZVgrzGVxs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedClasses() {
    console.log('--- SEEDING CLASSES ---');
    
    // 1. Get first academy and first professor
    const { data: academy } = await supabase.from('academies').select('id').limit(1).single();
    const { data: professor } = await supabase.from('profiles').select('id').eq('role', 'professor').limit(1).single();

    if (!academy || !professor) {
        console.error('Academy or Professor not found. Please create them first.');
        return;
    }

    console.log(`Using Academy: ${academy.id} and Professor: ${professor.id}`);

    const classes = [
        {
            academy_id: academy.id,
            title: "Aula Fundamentos (Gi)",
            start_time: "18:00:00",
            end_time: "19:30:00",
            day_of_week: 5,
            coach_id: professor.id,
            active: true,
            type: "gi"
        },
        {
            academy_id: academy.id,
            title: "Treino Livre / Sparring",
            start_time: "19:30:00",
            end_time: "21:00:00",
            day_of_week: 5,
            coach_id: professor.id,
            active: true,
            type: "nogi"
        },
        {
            academy_id: academy.id,
            title: "Aula Kids",
            start_time: "17:00:00",
            end_time: "18:00:00",
            day_of_week: 5,
            coach_id: professor.id,
            active: true,
            type: "gi"
        }
    ];

    console.log('Inserting classes...');
    const { error } = await supabase.from('classes').insert(classes);
    
    if (error) {
        console.error('Error inserting classes:', error);
    } else {
        console.log('Successfully seeded classes for today!');
    }
}

seedClasses();
