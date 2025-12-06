import type { Context } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import type { Database } from "./database.types.ts";


export const supabase = () => {
  return createMiddleware(async (c: Context, next) => {
    const client = createClient<Database, "public">(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: c.req.header('authorization') ?? '',
          },
        },
      }
    )
    const { error } = await client.auth.getUser()

    if (error) return c.json({ error }, 401)
    c.set('supabase', client)
    await next()
  })
}
