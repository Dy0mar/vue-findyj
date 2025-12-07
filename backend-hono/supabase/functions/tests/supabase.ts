import { createClient } from '@supabase/supabase-js';
import { Database } from "../api/database.types.ts";
import { getClient } from "../api/client.ts";
import { api } from "../api/index.ts";
import { HTTPMethod } from "../api/constants.ts";

export type SupabaseClient = ReturnType<typeof getClient>

function createSupabaseClient(): SupabaseClient {
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
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: Deno.env.get("TEST_USER_EMAIL")!,
    password: Deno.env.get("TEST_USER_PASSWORD")!,
  })
  if (error) {
    throw error
  }

  return supabase
}


export async function request(url: string, method: HTTPMethod, requestInit: RequestInit & { auth?: boolean } = {}) {
  const { auth, ...rest } = requestInit;

  const headers = new Headers(rest.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json;charset=UTF-8');
  }

  if (auth !== false) {
    const { data: { session } } = await (await supabase()).auth.getSession();
    if (session) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }

  return await api.request(
    url,
    {
      method,
      ...rest,
      headers,
    } satisfies RequestInit
  );
}
