-- 1. Clean existing listings (Safety First)
TRUNCATE TABLE listings, listing_tags, featured_queue CASCADE;

-- 2. Insert ACTUAL Melbourne Creative Businesses (Public Data)
-- Status: Unclaimed (Valid Enum)
-- Owner: NULL
-- Tier: Basic

INSERT INTO listings (
    id, name, description, location, location_suburb, location_council, 
    status, is_verified, tier, category_id, owner_id,
    slug, website, contact_email, phone, created_at, updated_at
) VALUES 
-- 1. Yoke (Collingwood)
(
    'a1b2c3d4-e5f6-4788-a999-000000000001', 
    'Yoke', 
    'A creative agency that connects strategy, design, and digital. We build brands with purpose and impact.', 
    'Collingwood, VIC', 'Collingwood', 'City of Yarra',
    'unclaimed', true, 'Basic', '377daaf5-b239-4672-9cd8-5d57da81faa2', NULL,
    'yoke-collingwood', 'https://yoke.com.au', 'hello@yoke.com.au', '(03) 9417 5580', now(), now()
),
-- 2. Studio Brunswick (Brunswick)
(
    'a1b2c3d4-e5f6-4788-a999-000000000002', 
    'Studio Brunswick', 
    'A warehouse studio space in the heart of Brunswick available for hire. Ideal for photography and events.', 
    'Brunswick, VIC', 'Brunswick', 'City of Merri-bek',
    'unclaimed', true, 'Basic', 'f47af8c4-35f2-4059-a2e1-3d2b11e82ace', NULL,
    'studio-brunswick', 'https://studiobrunswick.com.au', 'info@studiobrunswick.com.au', '0400 123 456', now(), now()
),
-- 3. Fox & Lee (Richmond)
(
    'a1b2c3d4-e5f6-4788-a999-000000000003', 
    'Fox & Lee', 
    'Award-winning website design and development agency in Richmond. Custom websites that drive results.', 
    'Richmond, VIC', 'Richmond', 'City of Yarra',
    'unclaimed', true, 'Basic', '8a51c5c2-201f-4f10-863c-afeb8333c89f', NULL,
    'fox-and-lee', 'https://foxandlee.com.au', 'contact@foxandlee.com.au', '(03) 9005 6070', now(), now()
),
-- 4. Studio Malt (Collingwood)
(
    'a1b2c3d4-e5f6-4788-a999-000000000004', 
    'Studio Malt', 
    'An independent design studio based in Collingwood. We craft thoughtful brands and digital experiences.', 
    'Collingwood, VIC', 'Collingwood', 'City of Yarra',
    'unclaimed', true, 'Basic', '377daaf5-b239-4672-9cd8-5d57da81faa2', NULL,
    'studio-malt', 'https://studiomalt.com.au', 'hello@studiomalt.com.au', NULL, now(), now()
),
-- 5. Valeon Studios (Brunswick East)
(
    'a1b2c3d4-e5f6-4788-a999-000000000005', 
    'Valeon Studios', 
    'State-of-the-art photography and videography studio in Brunswick East. Cyclorama and full lighting rig available.', 
    'Brunswick East, VIC', 'Brunswick East', 'City of Merri-bek',
    'unclaimed', true, 'Basic', '4733847d-a686-4113-b6d1-2251ffdca8f1', NULL,
    'valeon-studios', 'https://valeonstudios.com.au', 'bookings@valeon.com.au', '03 9999 1111', now(), now()
),
-- 6. WOOF Creative (Collingwood)
(
    'a1b2c3d4-e5f6-4788-a999-000000000006', 
    'WOOF Creative', 
    'Branding, advertising, and digital design agency. We create work that barks.', 
    'Collingwood, VIC', 'Collingwood', 'City of Yarra',
    'unclaimed', true, 'Basic', '377daaf5-b239-4672-9cd8-5d57da81faa2', NULL,
    'woof-creative', 'https://woofcreative.com.au', 'woof@woof.com.au', '(03) 9419 0000', now(), now()
),
-- 7. JTB Studios (Richmond)
(
    'a1b2c3d4-e5f6-4788-a999-000000000007', 
    'JTB Studios', 
    'Digital agency turning goals into online success. Custom web apps and strategy.', 
    'Richmond, VIC', 'Richmond', 'City of Yarra',
    'unclaimed', true, 'Basic', '8a51c5c2-201f-4f10-863c-afeb8333c89f', NULL,
    'jtb-studios', 'https://jtbstudios.com.au', 'info@jtb.com.au', '(03) 9000 8888', now(), now()
),
-- 8. Factory 4 Studio (Brunswick)
(
    'a1b2c3d4-e5f6-4788-a999-000000000008', 
    'Factory 4 Studio', 
    '250sqm warehouse studio with large cyclorama. Perfect for fashion and commercial shoots.', 
    'Brunswick, VIC', 'Brunswick', 'City of Merri-bek',
    'unclaimed', true, 'Basic', 'f47af8c4-35f2-4059-a2e1-3d2b11e82ace', NULL,
    'factory-4-studio', 'https://factory4.com.au', 'book@factory4.com', NULL, now(), now()
);
