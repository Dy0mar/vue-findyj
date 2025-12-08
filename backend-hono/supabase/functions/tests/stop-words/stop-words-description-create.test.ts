import { assertEquals } from '@std/assert'
import { DescriptionStopWordFactory } from "../test-utils/factories.ts";
import { request } from "../supabase.ts";
import { Table } from "../../api/client.ts";

const url = "/stop-words/description"
const factory = new DescriptionStopWordFactory()

Deno.test('Stop Words Description - create', async (t) => {
  await t.step("Should create a new stop word", async () => {
    const { data, test } = await factory.build()

    await test(async (supabase) => {
      const res = await request(url, 'POST', { body: JSON.stringify(data) })

      assertEquals(res.status, 201);
      const result = await supabase
        .from(Table.descriptionstopword)
        .select('word')
        .eq("word", data.word)
        .single();
      assertEquals(result.error, null)
      assertEquals(result.data?.word, data.word);
    })
  })
})
