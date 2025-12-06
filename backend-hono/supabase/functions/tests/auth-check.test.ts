import { assertEquals } from 'jsr:@std/assert@1'
import { api } from "../api/index.ts";
import { supabase } from "./supabase.ts";

const url = "/auth/check"

const unauthenticated = async () => {
  const res = await api.request(url);
  assertEquals(res.status, 401);
}

const authenticated = async () => {
  const { data: { session } } = await (await supabase()).auth.getSession()
  const access_token = session!.access_token

  const res = await api.request(url, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
  assertEquals(res.status, 200);
}


Deno.test('Unauthorized user does not have access', unauthenticated)
Deno.test('Authorized user does have access', authenticated)

