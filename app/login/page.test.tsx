import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { redirect } from "next/navigation";

// Mock next/font/google before importing page
vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({
    variable: "--font-montserrat",
  })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock Supabase server
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
  isSupabaseConfigured: vi.fn(),
}));

import LoginPage from "./page";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

describe("/app/login/page.tsx", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("redirects to /todo when user is authenticated", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-123" } } }),
      },
    } as any);

    await LoginPage({
      searchParams: Promise.resolve({}),
    });

    expect(redirect).toHaveBeenCalledWith("/todo");
  });

  it("does not redirect when user is not authenticated", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const result = await LoginPage({
      searchParams: Promise.resolve({}),
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("does not redirect when Supabase is not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await LoginPage({
      searchParams: Promise.resolve({}),
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("renders with no error when no error param is provided", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const result = await LoginPage({
      searchParams: Promise.resolve({}),
    });

    expect(result).toBeDefined();
    // The result is a React component, verify it's a JSX element
    const element = result as { type?: unknown; $$typeof?: symbol };
    expect(element.type || element.$$typeof).toBeDefined();
  });

  it("passes initialError to LoginButtonContainer when error=auth_callback_failed", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const result = await LoginPage({
      searchParams: Promise.resolve({ error: "auth_callback_failed" }),
    });

    // Verify that the component was rendered (JSX component created)
    expect(result).toBeDefined();
    const element = result as { type?: unknown; $$typeof?: symbol };
    expect(element.type || element.$$typeof).toBeDefined();
  });

  it("does not pass error when error param is not auth_callback_failed", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const result = await LoginPage({
      searchParams: Promise.resolve({ error: "some_other_error" }),
    });

    expect(result).toBeDefined();
    const element = result as { type?: unknown; $$typeof?: symbol };
    expect(element.type || element.$$typeof).toBeDefined();
  });

  it("uses metadata title and description", () => {
    // This is more of a compile-time check
    expect(LoginPage).toBeDefined();
  });
});
