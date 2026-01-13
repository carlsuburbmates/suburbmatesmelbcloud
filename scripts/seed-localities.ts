import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import 'dotenv/config';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_URL = 'https://raw.githubusercontent.com/carlsuburbmates/dtd-docs-private/refs/heads/master/DOCS/suburbs_councils_mapping.csv';

interface LocalityRow {
    suburb_name: string;
    council_name: string;
    region: string;
    state: string;
}

async function seedLocalities() {
    console.log('Fetching CSV data...');

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split('\n');
        let startIndex = 0;
        if (lines[0].toLowerCase().includes('suburb')) startIndex = 1;

        const records: LocalityRow[] = [];

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            if (cols.length < 2) continue;

            const suburb = cols[0].trim();
            const council = cols[1].trim();
            const region = cols[2]?.trim() || 'Greater Melbourne';

            records.push({
                suburb_name: suburb,
                council_name: council,
                region: region,
                state: 'VIC'
            });
        }

        // Deduplicate records by suburb_name
        const uniqueRecordsMap = new Map();
        for (const item of records) {
            if (!uniqueRecordsMap.has(item.suburb_name)) {
                uniqueRecordsMap.set(item.suburb_name, item);
            }
        }
        const uniqueRecords = Array.from(uniqueRecordsMap.values());

        console.log(`Parsed ${records.length} rows. Deduplicated to ${uniqueRecords.length} unique suburbs.`);

        if (uniqueRecords.length === 0) {
            console.warn("No records parsed. CSV might be empty or format unexpected.");
            return;
        }

        // Upsert in batches of 50
        const BATCH_SIZE = 50;
        for (let i = 0; i < uniqueRecords.length; i += BATCH_SIZE) {
            const batch = uniqueRecords.slice(i, i + BATCH_SIZE);

            const { error } = await supabase
                .from('localities')
                .upsert(batch, { onConflict: 'suburb_name' });

            if (error) {
                console.error('Error upserting batch:', error);
            } else {
                console.log(`Upserted batch ${i} - ${i + batch.length}`);
            }
        }

        console.log('Seeding complete.');

    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seedLocalities();
