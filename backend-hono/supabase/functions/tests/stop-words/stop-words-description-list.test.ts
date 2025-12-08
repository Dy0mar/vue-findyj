import { assertEquals } from '@std/assert'
import { DescriptionStopWordFactory } from "../test-utils/factories.ts";
import { request } from "../supabase.ts";

const url = "/stop-words/description"
const factory = new DescriptionStopWordFactory()

Deno.test('Stop Words Description - list', async (t) => {
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
      const json = await res.json();
      assertEquals(json, data);
    })
  })
})
