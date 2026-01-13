import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Ensure environment variables are checked/typed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, type')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
}

// --- Listings Search ---

export interface SearchListingsParams {
    query?: string;
    category?: string; // UUID
    location?: string; // Council Name
    filterVerified?: boolean;
    sortBy?: 'relevance' | 'alphabetical' | 'newest';
    limit?: number;
    offset?: number;
}

export async function searchListings({
    query = "",
    category,
    location,
    filterVerified = false,
    sortBy = 'relevance',
    limit = 20,
    offset = 0,
}: SearchListingsParams) {
    const { data, error } = await supabase.rpc('search_listings', {
        search_query: query || null,
        category_filter: category || null,
        location_filter: location || null,
        filter_verified: filterVerified,
        sort_by: sortBy,
        limit_val: limit,
        offset_val: offset,
    });

    if (error) {
        console.error("Error searching listings:", error);
        throw new Error("Failed to search listings");
    }

    return data || [];
}

// --- Products Search ---
export interface SearchProductsParams {
    query?: string;
    category?: string; // UUID
    location?: string; // Suburb Name (Catchment)
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
}

export async function searchProducts({
    query = "",
    category,
    location,
    minPrice,
    maxPrice,
    limit = 20,
    offset = 0,
}: SearchProductsParams) {
    const { data, error } = await supabase.rpc("search_products", {
        search_query: query || null,
        category_filter: category || null,
        location_filter: location || null,
        min_price: minPrice || null,
        max_price: maxPrice || null,
        limit_val: limit,
        offset_val: offset,
    });

    if (error) {
        console.error("Error searching products:", error);
        throw new Error("Failed to search products");
    }

    return data;
}
