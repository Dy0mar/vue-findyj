import { assert } from 'jsr:@std/assert@1'

const testEnvs = () => {
  for(const key of ["SITE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY", "ALLOWED_ORIGINS"]) {
    const value = Deno.env.get(key)
    assert(typeof value === "string", `env key ${key} does not exists`);
    assert(value.length > 0, `env key ${key} is empty`);
  }
}

Deno.test('required envs test', testEnvs)
