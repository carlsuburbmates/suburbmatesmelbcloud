// This module will contain data-fetching logic for creator listings.
import { supabase } from './supabase';
import type { Tables } from '@/types/supabase';

export const getListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      category:categories(name)
    `)
    // 1. Featured Bucket (Active featured items first)
    .order('featured_until', { ascending: false, nullsFirst: false })
    // 2. Pro Bucket (Pro > Basic, alphabet desc P > B works)
    .order('tier', { ascending: false })
    // 3. Verified Priority (True > False)
    .order('is_verified', { ascending: false })
    // 4. Freshness (Newest first)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as (Tables<'listings'> & { category: { name: string } })[];
};