import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Listener accounts (email link, no password) and their playlists live in Supabase.
 * Both values are public by design (row-level security protects the data). Without them
 * the site still works: Radio plays, the sign-in and playlist UI says accounts are off.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const accountsEnabled = Boolean(url && key);

let client: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (client === undefined) {
    client =
      url && key
        ? createClient(url, key, {
            auth: { flowType: "implicit", persistSession: true, detectSessionInUrl: true, storageKey: "ed8125-auth" },
          })
        : null;
  }
  return client;
}
