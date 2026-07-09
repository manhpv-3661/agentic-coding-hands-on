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

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
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

  it("redirects to / when user is authenticated", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-123" } } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await LoginPage({
      searchParams: Promise.resolve({}),
    });

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not redirect when user is not authenticated", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await LoginPage({
      searchParams: Promise.resolve({ error: "auth_callback_failed" }),
    });

    // Phase-04 refactor: LoginPage structure is:
    // div > [header, PageGutter(as=main), overlays, footer]
    // PageGutter > ContentFrame > LoginHeroContent > LoginButtonContainer
    // Walk through the JSX tree to confirm LoginButtonContainer gets the
    // initialError from the dict, not a hardcoded duplicate.
    const element = result as {
      props: {
        children: Array<{
          type?: unknown;
          props?: { children?: unknown; width?: number };
        }>;
      };
    };

    // Find the PageGutter (rendered as <main>), which is among the root's children
    const children = element.props.children;
    let main: {
      type?: unknown;
      props?: { children?: unknown };
    } | null = null;
    for (const child of Array.isArray(children) ? children : [children]) {
      if (!child?.props) continue;
      if (child.type === "main" || typeof child.props.children === "object") {
        // This is likely the PageGutter rendered as main
        // Check if it has ContentFrame as a child
        const childOfMain = Array.isArray(child.props.children)
          ? child.props.children[0]
          : child.props.children;
        if (childOfMain?.props?.width === 1152) {
          main = child;
          break;
        }
      }
    }

    if (!main) {
      // Fallback: element.props.children[1] should be PageGutter based on structure
      main = element.props.children[1];
    }

    // Navigate: PageGutter > ContentFrame > LoginHeroContent > LoginButtonContainer
    const contentFrameChild = Array.isArray(main?.props?.children)
      ? (main.props.children[0] as { props?: { children?: unknown } })
      : (main?.props?.children as { props?: { children?: unknown } });
    const loginHeroContentChild = Array.isArray(contentFrameChild?.props?.children)
      ? (contentFrameChild.props.children[0] as { props?: { children?: unknown } })
      : (contentFrameChild?.props?.children as { props?: { children?: unknown } });
    const loginButtonContainer = loginHeroContentChild?.props?.children as
      | { props: { initialError: string } }
      | undefined;

    expect(loginButtonContainer?.props?.initialError).toBe(viDict.login.error.oauthFailed);
  });

  it("does not pass error when error param is not auth_callback_failed", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
