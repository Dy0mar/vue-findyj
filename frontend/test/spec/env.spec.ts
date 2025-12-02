import { describe, it, expect } from "vitest";

describe("Environment Variables", () => {
  it("should load VITE_BASE_URL", () => {
    expect(import.meta.env.VITE_BASE_URL).toBeDefined();
    expect(typeof import.meta.env.VITE_BASE_URL).toBe("string");
  });

  it("should load VITE_SUPABASE_URL", () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(typeof import.meta.env.VITE_SUPABASE_URL).toBe("string");
  });

  it("should load VITE_SUPABASE_ANON_KEY", () => {
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(typeof import.meta.env.VITE_SUPABASE_ANON_KEY).toBe("string");
  });

  it("should have correct SUPABASE_URL format", () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    expect(supabaseUrl).toMatch(/^https?:\/\//);
  });
});
