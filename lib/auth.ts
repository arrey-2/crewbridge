import { cookies } from 'next/headers';
import { createServerClient } from './supabase';

export async function requireUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('cb-access-token')?.value;
  if (!token) return null;
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}
