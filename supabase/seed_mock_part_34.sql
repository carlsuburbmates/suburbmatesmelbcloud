INSERT INTO listings (
    id, name, description, location, location_suburb, location_council, 
    status, is_verified, tier, category_id, owner_id,
    slug, website, contact_email, phone, 
    lat, lng, location_geo, featured_until,
    created_at, updated_at
) VALUES 
(
    '0acc8a81-9bd1-488b-91b6-118f9111580c',
    'Mock Business Consulting Lilydale',
    'This is a mock listing for Business Consulting in Lilydale to test search and mapbox integration.',
    'Lilydale, VIC',
    'Lilydale',
    'Shire of Yarra Ranges',
    'unclaimed',
    false,
    'Basic',
    '26082d57-312f-4df3-99b4-7decb7e5c5aa',
    NULL,
    'mock-business-consulting-lilydale-388',
    'https://example.com/mock',
    'mock@example.com',
    '03 5555 5555',
    -37.759426030163716,
    145.34951169228444,
    ST_SetSRID(ST_MakePoint(145.34951169228444, -37.759426030163716), 4326)::geography,
    NULL,
    NOW(),
    NOW()
);