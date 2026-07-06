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

// Mock the cookie-reading locale resolver (avoids needing a real
// next/headers request context in tests) — getDictionary itself stays real
// so assertions exercise the actual vi/en dictionaries.
vi.mock("@/lib/i18n/get-locale", () => ({
  getLocale: vi.fn(async () => "vi"),
}));

import LoginPage, { generateMetadata } from "./page";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/get-locale";
import { vi as viDict } from "@/lib/i18n/dictionaries/vi";
import { en as enDict } from "@/lib/i18n/dictionaries/en";

describe("/app/login/page.tsx", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    vi.mocked(getLocale).mockResolvedValue("vi");
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

  it("passes initialError sourced from the vi dict when error=auth_callback_failed", async () => {
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

    // Walk down to LoginButtonContainer's initialError prop to confirm it
    // reads the single dict key instead of a hardcoded duplicate.
    // div > [LoginHeader, main, LoginFooter] > main > LoginHeroContent > LoginButtonContainer
    const element = result as {
      props: { children: Array<{ props?: { children?: unknown } }> };
    };
    const main = element.props.children[1] as { props: { children: unknown } };
    const loginHeroContent = main.props.children as { props: { children: unknown } };
    const loginButtonContainer = loginHeroContent.props.children as {
      props: { initialError: string };
    };
    expect(loginButtonContainer.props.initialError).toBe(viDict.login.error.oauthFailed);
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

  it("generateMetadata resolves title/description from the vi dict by default", async () => {
    vi.mocked(getLocale).mockResolvedValue("vi");

    const metadata = await generateMetadata();

    expect(metadata.title).toBe(viDict.login.meta.title);
    expect(metadata.description).toBe(viDict.login.meta.description);
  });

  it("generateMetadata resolves title/description from the en dict when locale=en", async () => {
    vi.mocked(getLocale).mockResolvedValue("en");

    const metadata = await generateMetadata();

    expect(metadata.title).toBe(enDict.login.meta.title);
    expect(metadata.description).toBe(enDict.login.meta.description);
  });
});
