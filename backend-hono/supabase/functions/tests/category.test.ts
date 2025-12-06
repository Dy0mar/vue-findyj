import { assert, assertEquals } from 'jsr:@std/assert@1'
import { CategoryFactory } from "./utils/factories.ts";
import { Category } from "../api/types.ts";
import { request } from "./supabase.ts";

const url = "/categories"
const categories = async () => {
  const { data, test } = await new CategoryFactory().create()

  await test(async () => {
    const res = await request(url, 'GET')

    assertEquals(res.status, 200);
    const json: Category[] = await res.json();
    assert(json.find((item) => item.id === data.id));
  })
}


Deno.test('Should response correct data', categories)
