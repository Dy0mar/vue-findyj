import { assertEquals } from '@std/assert'
import { request } from "./supabase.ts";

const url = "/auth/check"

const unauthenticated = async () => {
  const res = await request(url, 'GET', { auth: false })
  assertEquals(res.status, 401);
}

const authenticated = async () => {
  const res = await request(url, 'GET')
  assertEquals(res.status, 200);
}

const authCheck = async () => {
  const res = await request(url, 'GET')
  assertEquals(res.status, 200)
  const data = await res.json()
  assertEquals(data.message, "ok")
}


Deno.test('Unauthorized user does not have access', unauthenticated)
Deno.test('Authorized user does have access', authenticated)
Deno.test('Should return { message: "ok" } on success', authCheck)
