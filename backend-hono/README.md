# backend-hono

This is the backend for the UI, built with [Hono](https://hono.dev/) and running on [Supabase Edge Functions](https://supabase.com/docs/functions).

Hono is a small, simple, and ultrafast web framework for the Edge. Supabase Edge Functions are Deno-based TypeScript functions that run close to your users.

## Getting Started

### 1. Start Services

The development and testing environments rely on local Supabase services. Before running the application or tests, start the necessary services:

```bash
npx supabase start
```

### 2. Running the Function

To run the function locally for development, use the following command:

```bash
npx supabase functions serve api
```

### 3. Running the Tests

To execute the test suite, run the following command:

```bash
deno test --config ./path-to/deno.json --env-file=./path-to/.env.test --allow-all ./path-to/tests/ --trace-leaks
```

### 4. Running the Tests with coverage

```bash
deno test --config ./path-to/deno.json --env-file=./path-to/.env.test --allow-all ./path-to/tests/ --trace-leaks --coverage=coverage
```

### 5. Lint

```bash
deno lint --config ./api/deno.json
```

## Deployment

To deploy the function, run the following command:

```bash
npx supabase functions deploy api
```
