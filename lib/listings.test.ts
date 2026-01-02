import { describe, it, expect, vi } from 'vitest';
import { getListings } from './listings';
import { supabase } from './supabase';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn(),
  },
}));

describe('Listings Data Fetching', () => {
  it('should fetch all listings from the database', async () => {
    const mockListings = [
      { id: 1, name: 'Listing 1', category: 'Category A', location: 'Location 1', status: 'claimed' },
      { id: 2, name: 'Listing 2', category: 'Category B', location: 'Location 2', status: 'unclaimed' },
    ];
    const mockResponse = { data: mockListings, error: null };
    (supabase.select as any).mockResolvedValue(mockResponse);

    const result = await getListings();

    expect(supabase.from).toHaveBeenCalledWith('listings');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(result).toEqual(mockListings);
  });
});
