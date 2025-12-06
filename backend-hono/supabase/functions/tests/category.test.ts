import { assert, assertEquals } from 'jsr:@std/assert@1'
import { CategoryFactory } from "./utils/factories.ts";
import { Category } from "../api/types.ts";
import { api } from "../api/index.ts";

const url = "/categories"
const categories = async () => {
  const { data, test } = await new CategoryFactory().create()

  await test(async (supabase) => {
    const { data: { session } } = await supabase.auth.getSession()
    const access_token = session!.access_token

    const res = await api.request(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    assertEquals(res.status, 200);
    const json: Category[] = await res.json();
    assert(json.find((item) => item.id === data.id));
  })
}


Deno.test('Should response correct data', categories)
