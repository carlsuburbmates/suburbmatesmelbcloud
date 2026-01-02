import { describe, it, expect, vi } from 'vitest';
import { signInWithMagicLink } from './auth';
import { supabase } from './supabase';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}));

describe('Auth Logic', () => {
  it('should call signInWithOtp with the correct email', async () => {
    const email = 'test@example.com';
    const mockResponse = { data: {}, error: null };
    (supabase.auth.signInWithOtp as any).mockResolvedValue(mockResponse);

    const result = await signInWithMagicLink(email);

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email,
      options: {
        emailRedirectTo: expect.any(String),
      },
    });
    expect(result).toEqual(mockResponse);
  });
});
