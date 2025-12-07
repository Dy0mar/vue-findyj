import { assert } from '@std/assert'
import { sleep } from '../../api/utils/time.ts'

Deno.test('sleep', async (t) => {
  await t.step('should delay execution for the specified amount of time', async () => {
    const start = Date.now()
    await sleep(100)
    const end = Date.now()
    assert(end - start >= 100)
  })

  await t.step('should delay execution for the default amount of time', async () => {
    const start = Date.now()
    await sleep()
    const end = Date.now()
    assert(end - start >= 500)
  })
})
