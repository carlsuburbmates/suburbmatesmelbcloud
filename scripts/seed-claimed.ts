
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedClaimed() {
    const { data: category } = await supabase.from('categories').select('id').limit(1).single();

    if (!category) {
        console.error("No categories found. Run seed-categories first.");
        return;
    }

    const { data, error } = await supabase
        .from('listings')
        .insert([
            {
                name: 'Defined Test Business',
                status: 'claimed',
                category_id: category.id,
                location: 'Melbourne',
                description: 'A fully claimed test business for automation verification.',
                is_verified: true,
                tier: 'Basic',
                slug: 'defined-test-business',
                contact_email: 'test@example.com'
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error seeding claimed listing:', error);
    } else {
        console.log('Seeded Claimed Listing:', data.name);
    }
}

seedClaimed();
