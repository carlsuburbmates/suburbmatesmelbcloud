// This module will contain data-fetching logic for creator listings.
import { supabase } from './supabase';

export const getListings = async () => {
  const { data, error } = await supabase.from('listings').select('*');
  if (error) {
    throw new Error(error.message);
  }
  return data;
};