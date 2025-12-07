import { assertEquals } from '@std/assert'
import { TitleStopWordFactory } from "./test-utils/factories.ts";
import { request } from "./supabase.ts";
import { Table } from "../api/client.ts";

const url = "/stop-words/title"
const factory = new TitleStopWordFactory()

Deno.test('Stop Words Title list - create', async (t) => {
  await t.step("Should create a new stop word", async () => {
    const { data, test } = await factory.build()

    await test(async (supabase) => {
      const res = await request(url, 'POST', { body: JSON.stringify(data) })

      assertEquals(res.status, 201);
      const result = await supabase
        .from(Table.titlestopword)
        .select('word')
        .eq("word", data.word)
        .single();
      assertEquals(result.error, null)
      assertEquals(result.data?.word, data.word);
    })
  })
})
