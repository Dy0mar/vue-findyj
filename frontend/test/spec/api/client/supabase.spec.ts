import { beforeEach, describe, expect, it, vi } from "vitest";

describe("supabase", () => {
  beforeEach(() => {
    vi.resetModules(); // Clear module cache
  });

  it.each([
    { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "test-key", missing: "VITE_SUPABASE_URL" },
    { VITE_SUPABASE_URL: "https://test.supabase.co", VITE_SUPABASE_ANON_KEY: "", missing: "VITE_SUPABASE_ANON_KEY" },
  ])("should throw error when $missing is missing", async ({ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY }) => {
    vi.stubEnv("VITE_SUPABASE_URL", VITE_SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", VITE_SUPABASE_ANON_KEY);

    await expect(async () => {
      await import("src/api/client/supabase");
    }).rejects.toThrow();
  });

  it("should initialize supabase client with valid credentials", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

    const { supabase } = await import("src/api/client/supabase");
    expect(supabase).toBeDefined();
  });
});
