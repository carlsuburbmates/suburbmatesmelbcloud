// This module will contain data-fetching logic for creator listings.
import { supabase } from './supabase';
import type { Tables } from '@/types/supabase';

export const getListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      category:categories(name)
    `);

  if (error) {
    throw error;
  }

  return data as (Tables<'listings'> & { category: { name: string } })[];
};