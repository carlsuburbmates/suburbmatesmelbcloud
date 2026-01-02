-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_creator BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT
);

-- Business Categories table
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Product Categories table
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES business_categories(id),
    owner_id UUID REFERENCES users(id),
    is_claimed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    tier TEXT DEFAULT 'Basic',
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    business_id UUID REFERENCES businesses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Businesses RLS
CREATE POLICY "Public can view all businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Creators can create businesses" ON businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Creators can update their own businesses" ON businesses FOR UPDATE USING (auth.uid() = owner_id);

-- Products RLS
CREATE POLICY "Public can view all products" ON products FOR SELECT USING (true);
CREATE POLICY "Creators can create products" ON products FOR INSERT WITH CHECK (
    auth.uid() = (SELECT owner_id FROM businesses WHERE id = business_id)
);
CREATE POLICY "Creators can update their own products" ON products FOR UPDATE USING (
    auth.uid() = (SELECT owner_id FROM businesses WHERE id = business_id)
);

-- Business Categories RLS
CREATE POLICY "Public can view all business categories" ON business_categories FOR SELECT USING (true);

-- Product Categories RLS
CREATE POLICY "Public can view all product categories" ON product_categories FOR SELECT USING (true);
