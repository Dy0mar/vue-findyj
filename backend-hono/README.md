# backend-hono

This is the backend for the UI, based on Supabase Edge Functions.

## Running the function

To run the function locally, use the following command:

```bash
npx supabase functions serve api
```

## Running the tests

```bash
deno test --config ./path-to/deno.json --allow-all ./path-to/tests/api-test.ts
```
