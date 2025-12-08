import { assert } from '@std/assert'

const testEnvs = () => {
  for(const key of ["SITE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY", "ALLOWED_ORIGINS", "TEST_MODE"]) {
    const value = Deno.env.get(key)
    assert(typeof value === "string", `env key ${key} does not exists`);
    assert(value.length > 0, `env key ${key} is empty`);
  }
}

Deno.test('required envs test', testEnvs)
