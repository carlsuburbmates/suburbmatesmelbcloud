
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyColumns() {
    console.log("--- Verifying Columns in public.listings ---");

    // Fetch 1 row with the specific columns we care about
    const { data, error } = await supabase
        .from('listings')
        .select('id, name, abn, is_verified, tier, featured_until')
        .limit(1);

    if (error) {
        console.error("ERROR: Could not fetch columns.", error.message);
    } else {
        console.log("SUCCESS: Columns exist and are queryable.");
        if (data.length > 0) {
            console.log("Sample Row:", data[0]);
        } else {
            console.log("Table is empty, but columns are valid.");
        }
    }
}

verifyColumns();
