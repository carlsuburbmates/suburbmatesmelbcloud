
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Service Role Key or URL');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validate() {
    console.log('Validating Taxonomy against DB...');

    // 1. Fetch DB Categories
    const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('name, type')
        .order('type')
        .order('name');

    if (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }

    // 2. Load Contract
    const contractPath = path.join(process.cwd(), 'docs/SSOT/taxonomy_contract.json');
    const contractRaw = fs.readFileSync(contractPath, 'utf-8');
    const contract = JSON.parse(contractRaw);

    const contractCategories = contract.categories.sort((a: any, b: any) =>
        a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
    );

    // 3. Compare
    console.log(`DB Count: ${dbCategories.length}`);
    console.log(`Contract Count: ${contractCategories.length}`);

    let mismatch = false;
    if (dbCategories.length !== contractCategories.length) mismatch = true;

    for (let i = 0; i < Math.min(dbCategories.length, contractCategories.length); i++) {
        const db = dbCategories[i];
        const con = contractCategories[i];
        if (db.name !== con.name || db.type !== con.type) {
            console.error(`Mismatch at index ${i}: DB[${db.name}, ${db.type}] vs Contract[${con.name}, ${con.type}]`);
            mismatch = true;
        }
    }

    if (mismatch) {
        console.error('❌ VALIDATION FAILED: Database does not match Contract.');
        process.exit(1);
    } else {
        console.log('✅ VALIDATION PASSED: Database matches SSOT.');
    }
}

validate().catch(console.error);
