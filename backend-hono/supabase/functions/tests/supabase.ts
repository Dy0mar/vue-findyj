import { createClient } from '@supabase/supabase-js';
import { Database } from "../api/database.types.ts";
import { getClient } from "../api/client.ts";

export type SupabaseClient = ReturnType<typeof getClient>

export function createSupabase(): SupabaseClient {
  return createClient<Database, "public">(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
    }
  )
}

export async function supabase() {
  const supabase = createSupabase()
  const { error } = await supabase.auth.signInWithPassword({
    email: Deno.env.get("TEST_USER_EMAIL")!,
    password: Deno.env.get("TEST_USER_PASSWORD")!,
  })
  if (error) {
    throw error
  }

  return supabase
}
