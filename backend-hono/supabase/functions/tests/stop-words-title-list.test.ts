import { assertEquals } from '@std/assert'
import { TitleStopWordFactory } from "./test-utils/factories.ts";
import { StopWord } from "../api/types.ts";
import { request } from "./supabase.ts";

const url = "/stop-words/title"
const factory = new TitleStopWordFactory()

Deno.test.ignore('/stop-words/title list', async (t) => {
  // todo: fix select when tests
  await t.step("Should return empty list", async () => {
    const res = await request(url, 'GET')
    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json, []);
  })

  await t.step("Should return generated data", async () => {
    const { data, test } = await factory.batch(2)

    await test(async () => {
      const res = await request(url, 'GET')

      assertEquals(res.status, 200);
      const json: StopWord[] = await res.json();
      assertEquals(json, data);
    })
  })
})
