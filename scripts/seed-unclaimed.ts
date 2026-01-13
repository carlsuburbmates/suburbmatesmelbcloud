import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map Name to UUID from Step 2349
const CATEGORY_IDS: Record<string, string> = {
    'Brand Identity': '377daaf5-b239-4672-9cd8-5d57da81faa2',
    'Web Design': 'f82cbf89-3cb3-46d2-85fb-8677c94cab53',
    'SEO & Strategy': 'f3812c1b-94c7-4cae-8d9a-33669635b033',
    'Videography': '4733847d-a686-4113-b6d1-2251ffdca8f1'
};

async function seedUnclaimedListings() {
    console.log('Seeding valid Unclaimed Listings...');

    // 1. Get valid suburbs (Truth reference)
    const { data: suburbs, error: locError } = await supabase
        .from('localities')
        .select('*')
        .in('suburb_name', ['Fitzroy', 'Richmond', 'St Kilda', 'Brunswick', 'South Melbourne']);

    if (locError || !suburbs) {
        console.error('Failed to fetch localities:', locError);
        return;
    }

    console.log(`Found ${suburbs.length} target suburbs for seeding.`);

    // 2. Define Valid Digital Creator Personas
    const personas = [
        {
            name: 'Fitzroy Branding Studio',
            category: 'Brand Identity',
            suburb: 'Fitzroy',
            description: 'Specializing in minimal brand identity for local hospitality.',
            slug: 'fitzroy-branding-studio'
        },
        {
            name: 'Richmond Webflow Dev',
            category: 'Web Design',
            suburb: 'Richmond',
            description: 'Webflow developer for startups and small business.',
            slug: 'richmond-webflow'
        },
        {
            name: 'South Melb SEO',
            category: 'SEO & Strategy',
            suburb: 'South Melbourne',
            description: 'Local SEO strategy for brick and mortar businesses.',
            slug: 'south-melb-seo'
        },
        {
            name: 'Brunswick Video Lab',
            category: 'Videography',
            suburb: 'Brunswick',
            description: 'Event and promo videography for creatives.',
            slug: 'brunswick-video'
        }
    ];

    // 3. Upsert Listings with Correct Columns
    for (const p of personas) {
        const locality = suburbs.find(s => s.suburb_name === p.suburb);
        if (!locality) {
            console.warn(`Skipping ${p.name}: Suburb ${p.suburb} not found in DB.`);
            continue;
        }

        const payload = {
            owner_id: null, // Unclaimed
            slug: p.slug,
            name: p.name, // Correct column name
            category_id: CATEGORY_IDS[p.category], // Correct column name & type
            description: p.description,
            status: 'unclaimed',
            triage_status: 'safe',

            // Geographical Truth
            location: `${locality.suburb_name}, VIC`, // Legacy text fallback
            location_suburb: locality.suburb_name,
            location_council: locality.council_name, // Inherited truth
            location_state: 'VIC',
        };

        const { error } = await supabase
            .from('listings')
            .upsert(payload, { onConflict: 'slug' });

        if (error) {
            console.error(`Failed to seed ${p.name}:`, error);
        } else {
            console.log(`Seeded: ${p.name} (${p.category}) in ${locality.council_name}`);
        }
    }
}

seedUnclaimedListings();
