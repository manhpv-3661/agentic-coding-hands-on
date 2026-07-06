import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient, isSupabaseConfigured } from "./client";

describe("lib/supabase/client", () => {
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

    it("returns false when URL is empty string", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      expect(isSupabaseConfigured()).toBe(false);
    });

    it("returns false when ANON_KEY is empty string", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe("createClient", () => {
    it("returns a Supabase client instance", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = createClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it("creates client without throwing when env is set", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      expect(() => {
        createClient();
      }).not.toThrow();
    });

    it("has signInWithOAuth method available", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const client = createClient();
      expect(client.auth.signInWithOAuth).toBeDefined();
    });
  });
});
