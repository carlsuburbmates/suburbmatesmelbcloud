import { describe, it, expect, beforeAll } from 'vitest';
import { supabaseAdmin } from '../../lib/supabase-admin';

describe('User Profile Auto-creation Trigger', () => {
  const testEmail = `test-${Math.random()}@example.com`;
  const testPassword = 'password123';
  let userId: string;

  beforeAll(async () => {
    // Cleanup if needed (rare case)
  });

  it('should create a profile record when a new user signs up', async () => {
    // 1. Create user in auth schema
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (authError) throw authError;
    userId = authData.user.id;

    // 2. Check if profile exists in public schema
    // This is expected to fail (returning no rows) until the trigger is implemented
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is 'no rows found' for single()
        throw profileError;
    }

    expect(profileData).toBeDefined();
    expect(profileData?.email).toBe(testEmail);
    expect(profileData?.role).toBe('visitor');
  });

  // Cleanup after test
  // NOTE: In a real environment, we'd delete the user.
});
