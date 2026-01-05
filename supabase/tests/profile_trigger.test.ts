/* eslint-disable no-undef */
import {
  beforeAll, describe, it, expect,
} from 'vitest';
import { signUpUser, supabaseAdmin } from './utils';

describe('User Actor Auto-creation Trigger', () => {
  let user;
  let testEmail;

  beforeAll(async () => {
    // Generate a random email for each test run
    testEmail = `testuser_${Date.now()}@example.com`;
    // Sign up a new user
    const { data, error } = await signUpUser(testEmail);
    if (error) {
      throw new Error(`User sign-up failed: ${error.message}`);
    }
    user = data.user;
  });

  it('should create an actor record when a new user signs up', async () => {
    expect(user).toBeDefined();

    // 2. Check if actor exists in public schema
    try {
      const { data: actorData, error: actorError } = await supabaseAdmin
        .from('actors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (actorError && actorError.code !== 'PGRST116') { // PGRST116: "exact one row expected, but 0 rows were found"
        throw actorError;
      }

      expect(actorData).toBeDefined();
      expect(actorData?.email).toBe(testEmail);
      expect(actorData?.role).toBe('visitor');
    } catch (e) {
      // Re-throw the error with more context for easier debugging
      throw new Error(`Error querying for new actor: ${e.message}`);
    }
  });
});
