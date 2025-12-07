import { assertEquals } from '@std/assert'
import { TitleStopWordFactory } from "./test-utils/factories.ts";
import { request } from "./supabase.ts";

const url = "/stop-words/title"
const factory = new TitleStopWordFactory()

Deno.test('/stop-words/title delete', async (t) => {
  await t.step("Should delete a stop word", async () => {
    const { data, test } = await factory.create()
    await test(async () => {
      const deleteUrl = `${url}/${data.id}`
      const res = await request(deleteUrl, 'DELETE')
      assertEquals(res.status, 204);
    })
  })
})
