import { assert, assertEquals } from 'jsr:@std/assert@1'
import { myApp } from "../api/index.ts";
import { CategoryFactory } from "./utils/factories.ts";
import { Category } from "../api/types.ts";

const factory = new CategoryFactory()

const categories = async () => {
  const { data, cleanUp } = await factory.create()

  try {
    const res = await myApp.request('/api/categories', {
      method: 'GET',
    })

    assertEquals(res.status, 200)
    const json: Category[] = await res.json()
    assert(json.find((item) => item.id === data.id))
  } finally {
    await cleanUp()
  }
}

Deno.test('/api/categories', categories)
