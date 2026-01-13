import { supabase } from './supabase';

export const signInWithMagicLink = async (email: string, redirectTo?: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const finalRedirect = redirectTo ? `${origin}${redirectTo}` : `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: finalRedirect,
    },
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};
