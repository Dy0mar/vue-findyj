import { assertEquals } from 'jsr:@std/assert@1'
import { myApp } from "../api/index.ts";

const authCheck = async () => {
  const res = await myApp.request('/api/auth/check', {
    method: 'GET',
})
  assertEquals(res.status, 200)
  const data = await res.json()
  assertEquals(data.message, "ok")
}

Deno.test('Should return { message: "ok" } on success', authCheck)
