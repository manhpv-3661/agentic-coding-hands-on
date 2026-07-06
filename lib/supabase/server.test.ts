import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createClient, isSupabaseConfigured } from "./server";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

describe("lib/supabase/server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isSupabaseConfigured", () => {
    it("returns true when both URL and ANON_KEY are set", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      expect(isSupabaseConfigured()).toBe(true);
    });

    it("returns false when URL is missing", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      expect(isSupabaseConfigured()).toBe(false);
    });

    it("returns false when ANON_KEY is missing", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;

      expect(isSupabaseConfigured()).toBe(false);
    });

    it("returns false when both are missing", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;

      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe("createClient", () => {
    it("is async and returns a Supabase client", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = await createClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it("has auth.getUser method", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = await createClient();
      expect(client.auth.getUser).toBeDefined();
    });

    it("has auth.exchangeCodeForSession method", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = await createClient();
      expect(client.auth.exchangeCodeForSession).toBeDefined();
    });

    it("has auth.signOut method", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = await createClient();
      expect(client.auth.signOut).toBeDefined();
    });
  });
});
