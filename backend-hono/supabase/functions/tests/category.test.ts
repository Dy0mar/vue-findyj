import { assert, assertEquals } from '@std/assert'
import { CategoryFactory } from "./test-utils/factories.ts";
import { Category } from "../api/types.ts";
import { request } from "./supabase.ts";

const url = "/categories"

Deno.test('categories', async (t) => {
  // todo: fix select when tests
  // await t.step("Should return empty list", async () => {
  //   const res = await request(url, 'GET')
  //   assertEquals(res.status, 200);
  //   const json: Category[] = await res.json();
  //   assertEquals(json, []);
  // })

  await t.step("Should return generated data", async () => {
    const { data, test } = await new CategoryFactory().create()

    await test(async () => {
      const res = await request(url, 'GET')

      assertEquals(res.status, 200);
      const json: Category[] = await res.json();
      assert(json.find((item) => item.id === data.id));
    })
  })
})
