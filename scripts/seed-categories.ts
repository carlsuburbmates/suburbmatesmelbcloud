import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// ES Module-compatible way to get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly resolve the path to .env.local
const envPath = path.resolve(__dirname, '../.env.local');
config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const seedCategories = async () => {
  try {
    const taxonomyPath = path.resolve(__dirname, '../docs/SSOT/taxonomy_contract.json');
    const taxonomyFile = fs.readFileSync(taxonomyPath, 'utf8');
    const { categories } = JSON.parse(taxonomyFile);

    // We use upsert to avoid creating duplicates
    const { data, error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'type,name' });

    if (error) {
      throw error;
    }

    console.log('Categories seeded successfully.');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

seedCategories();
