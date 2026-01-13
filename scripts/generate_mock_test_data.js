const fs = require('fs');
const path = require('path');

// 1. Categories (Mapped from DB)
const CATEGORIES = {
    'Brand Identity': '377daaf5-b239-4672-9cd8-5d57da81faa2',
    'Web Design': 'f82cbf89-3cb3-46d2-85fb-8677c94cab53',
    'UI/UX Design': '9e093a47-6200-422e-b1fd-df670a2e5f06',
    'Illustration': 'ffece359-4ad1-4858-af68-7eb835d50896',
    'Photography': 'f47af8c4-35f2-4059-a2e1-3d2b11e82ace',
    'Videography': '4733847d-a686-4113-b6d1-2251ffdca8f1',
    'Audio Production': '11ab4383-53aa-4f2a-a82e-5e432d0caf16',
    'Animation': 'd891c256-1809-4545-adb2-d98854aa4716',
    'Social Media Management': '185cce80-84f5-494b-ad0c-f7e51fa4d171',
    'Copywriting': '2b79d905-8c2d-4e7e-8020-4ae0c88a9232',
    'Content Marketing': 'e94917a2-074d-4b97-b055-de6eba65082c',
    'SEO & Strategy': 'f3812c1b-94c7-4cae-8d9a-33669635b033',
    'Web Development': '8a51c5c2-201f-4f10-863c-afeb8333c89f',
    'No-Code Automation': 'd0e115fd-dd3e-4d1d-9a22-bac085891e0f',
    'App Development': '955b962c-d840-4811-8b0b-c1fca9353f80',
    'Business Consulting': '26082d57-312f-4df3-99b4-7decb7e5c5aa'
};

// 2. Melbourne LGAs (Representative Suburb + Lat/Lng)
const LGAS = [
    { council: 'City of Banyule', suburb: 'Ivanhoe', lat: -37.7703, lng: 145.0457 },
    { council: 'City of Bayside', suburb: 'Sandringham', lat: -37.9525, lng: 145.0123 },
    { council: 'City of Boroondara', suburb: 'Camberwell', lat: -37.8167, lng: 145.0667 },
    { council: 'City of Brimbank', suburb: 'Sunshine', lat: -37.7810, lng: 144.8320 },
    { council: 'Shire of Cardinia', suburb: 'Officer', lat: -38.0581, lng: 145.4089 },
    { council: 'City of Casey', suburb: 'Narre Warren', lat: -38.0198, lng: 145.2996 },
    { council: 'City of Darebin', suburb: 'Preston', lat: -37.7419, lng: 145.0078 },
    { council: 'City of Frankston', suburb: 'Frankston', lat: -38.1333, lng: 145.1167 },
    { council: 'City of Glen Eira', suburb: 'Caulfield', lat: -37.8840, lng: 145.0266 },
    { council: 'City of Greater Dandenong', suburb: 'Dandenong', lat: -37.9810, lng: 145.2150 },
    { council: 'City of Hobsons Bay', suburb: 'Altona', lat: -37.8680, lng: 144.8300 },
    { council: 'City of Hume', suburb: 'Broadmeadows', lat: -37.6850, lng: 144.9250 },
    { council: 'City of Kingston', suburb: 'Mentone', lat: -37.9850, lng: 145.0689 },
    { council: 'City of Knox', suburb: 'Wantirna South', lat: -37.8810, lng: 145.2240 },
    { council: 'City of Manningham', suburb: 'Doncaster', lat: -37.7800, lng: 145.1240 },
    { council: 'City of Maribyrnong', suburb: 'Footscray', lat: -37.8051, lng: 144.9004 },
    { council: 'City of Maroondah', suburb: 'Ringwood', lat: -37.8110, lng: 145.2310 },
    { council: 'City of Melbourne', suburb: 'Melbourne', lat: -37.8142, lng: 144.9631 },
    { council: 'City of Melton', suburb: 'Melton', lat: -37.6833, lng: 144.5833 },
    { council: 'City of Merri-bek', suburb: 'Coburg', lat: -37.7438, lng: 144.9645 },
    { council: 'City of Monash', suburb: 'Glen Waverley', lat: -37.8800, lng: 145.1640 },
    { council: 'City of Moonee Valley', suburb: 'Moonee Ponds', lat: -37.7650, lng: 144.9200 },
    { council: 'Mornington Peninsula Shire', suburb: 'Mornington', lat: -38.2280, lng: 145.0620 },
    { council: 'Shire of Nillumbik', suburb: 'Greensborough', lat: -37.6860, lng: 145.1170 },
    { council: 'City of Port Phillip', suburb: 'St Kilda', lat: -37.8640, lng: 144.9820 },
    { council: 'City of Stonnington', suburb: 'Malvern', lat: -37.8562, lng: 145.0296 },
    { council: 'City of Whitehorse', suburb: 'Nunawading', lat: -37.8170, lng: 145.1770 },
    { council: 'City of Whittlesea', suburb: 'Epping', lat: -37.6378, lng: 145.0264 },
    { council: 'City of Wyndham', suburb: 'Wyndham Vale', lat: -37.8900, lng: 144.6300 },
    { council: 'City of Yarra', suburb: 'Richmond', lat: -37.8230, lng: 144.9980 },
    { council: 'Shire of Yarra Ranges', suburb: 'Lilydale', lat: -37.7580, lng: 145.3500 }
];

function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function escapeSql(str) {
    return str.replace(/'/g, "''");
}

const OUTPUT_FILE = path.join(__dirname, '../supabase/seed_mock_test_data.sql');

let entries = [];

LGAS.forEach((lga, lgaIndex) => {
    Object.entries(CATEGORIES).forEach(([catName, catId], catIndex) => {
        // Randomize variations
        const isPro = Math.random() < 0.3; // 30% Pro
        const isVerified = Math.random() < 0.5; // 50% Verified
        const isFeatured = Math.random() < 0.05; // 5% Featured
        
        // Jitter location slightly to avoid stacking exact same pin for all categories in one suburb
        const jitter = 0.005; 
        const lat = lga.lat + (Math.random() * jitter - jitter/2);
        const lng = lga.lng + (Math.random() * jitter - jitter/2);

        const id = generateUuid();
        const name = `Mock ${catName} ${lga.suburb}`;
        const slug = `mock-${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lga.suburb.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random()*1000)}`;
        
        const tier = isPro ? 'Pro' : 'Basic';
        // Mock featured timestamp: future date if featured, null otherwise
        const featuredUntil = isFeatured ? "NOW() + INTERVAL '30 days'" : "NULL";
        
        // Status: 'unclaimed'
        // Owner: NULL
        
        entries.push(`(
    '${id}',
    '${escapeSql(name)}',
    'This is a mock listing for ${catName} in ${lga.suburb} to test search and mapbox integration.',
    '${escapeSql(lga.suburb + ', VIC')}',
    '${escapeSql(lga.suburb)}',
    '${escapeSql(lga.council)}',
    'unclaimed',
    ${isVerified},
    '${tier}',
    '${catId}',
    NULL,
    '${slug}',
    'https://example.com/mock',
    'mock@example.com',
    '03 5555 5555',
    ${lat},
    ${lng},
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
    ${featuredUntil},
    NOW(),
    NOW()
)`);
    });
});


const BATCH_SIZE = 15;
const OUTPUT_DIR = path.join(__dirname, '../supabase');
const TRUNCATE_CMD = "TRUNCATE TABLE listings, listing_tags, featured_queue CASCADE;";

// Write Truncate First
fs.writeFileSync(path.join(OUTPUT_DIR, 'seed_mock_part_0.sql'), TRUNCATE_CMD);
console.log(`Generated part 0 (TRUNCATE)`);

let batchCount = 1;
for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    

    const sql = `INSERT INTO listings (
    id, name, description, location, location_suburb, location_council, 
    status, is_verified, tier, category_id, owner_id,
    slug, website, contact_email, phone, 
    lat, lng, location_geo, featured_until,
    created_at, updated_at
) VALUES 
${batch.map(entry => {
    // We need to inject the location_geo value into the VALUES list.
    // The entry string is currently: "('id', 'name', ... , lat, lng, featured, created, updated)"
    // We need to insert generic SQL expression "ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography" before featured_until.
    // This is getting parsing-heavy. I should just update the PUSH loop above.
    return entry; 
}).join(',\n')};`;


    const filename = path.join(OUTPUT_DIR, `seed_mock_part_${batchCount}.sql`);
    fs.writeFileSync(filename, sql);
    console.log(`Generated part ${batchCount} (${batch.length} items)`);
    batchCount++;
}

console.log(`Successfully generated ${entries.length} items across ${batchCount} files.`);

