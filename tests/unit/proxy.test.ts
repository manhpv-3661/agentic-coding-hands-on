import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";

// Mock Supabase server client
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

import { createServerClient } from "@supabase/ssr";

describe("proxy.ts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns passthrough when Supabase env is not configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await proxy(request);

    // Should be a NextResponse.next, not a redirect
    expect(response.status).toBe(200);
  });

  it("redirects authenticated user from /login to /", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await proxy(request);

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects unauthenticated user from /todo to /login", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/todo"));
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows authenticated user to access /todo", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/todo"));
    const response = await proxy(request);

    // No redirect - allow through
    expect(response.status).toBe(200);
  });

  it("allows unauthenticated user to access /login", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await proxy(request);

    // No redirect - allow through
    expect(response.status).toBe(200);
  });

  it("allows other routes to pass through", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/some-public"));
    const response = await proxy(request);

    // No redirect for routes not matched
    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated user from / to /login", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/"));
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated user from /awards to /login", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/awards"));
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated user from /kudos to /login", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/kudos"));
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows authenticated user to access /", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
        }),
      },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/"));
    const response = await proxy(request);

    expect(response.status).toBe(200);
  });

  it("handles /todo subpaths the same as /todo", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as any);

    const request = new NextRequest(
      new URL("http://localhost:3000/todo/some-subpath")
    );
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("calls getUser to check authentication status", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: null },
    });

    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as any);

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    await proxy(request);

    expect(mockGetUser).toHaveBeenCalled();
  });

  // Time-gate tests (FR-001..007, BR-001, BR-002)
  describe("Time-gate (Countdown Prelaunch) — before launch", () => {
    beforeEach(() => {
      // Set event start to future (before-launch state)
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours ahead
      process.env.NEXT_PUBLIC_EVENT_START_AT = futureDate.toISOString();
    });

    it("redirects / to /prelaunch?next=%2F before launch (FR-001, FR-006)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      expect(location).toContain("next=%2F");
    });

    it("redirects /login to /prelaunch?next=%2Flogin before launch (BR-001)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/login"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      expect(location).toContain("next=%2Flogin");
    });

    it("redirects /awards to /prelaunch?next=%2Fawards before launch (FR-001, FR-006)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/awards"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      expect(location).toContain("next=%2Fawards");
    });

    it("redirects /kudos to /prelaunch?next=%2Fkudos before launch (FR-001, FR-006)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/kudos"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      expect(location).toContain("next=%2Fkudos");
    });

    it("redirects /todo to /prelaunch?next=%2Ftodo before launch (FR-001, FR-006)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/todo"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      expect(location).toContain("next=%2Ftodo");
    });

    it("allows /prelaunch itself through without redirect (BR-001, no self-loop)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/prelaunch"));
      const response = await proxy(request);

      // Should be 200 (no redirect to /prelaunch again)
      expect(response.status).toBe(200);
    });

    it("encodes path+query in ?next= correctly (e.g. /awards?foo=bar)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);

      const request = new NextRequest(
        new URL("http://localhost:3000/awards?foo=bar&baz=qux")
      );
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/prelaunch");
      // URL encode: /awards?foo=bar&baz=qux → %2Fawards%3Ffoo%3Dbar%26baz%3Dqux
      expect(location).toContain("next=");
      // Verify next param is present and encodes the full path+query
      const nextMatch = location.match(/next=([^&]*)/);
      if (nextMatch) {
        const decodedNext = decodeURIComponent(nextMatch[1]);
        expect(decodedNext).toBe("/awards?foo=bar&baz=qux");
      }
    });
  });

  describe("Time-gate after launch or env unset", () => {
    it("falls through to auth-gate when env is past date (after launch)", async () => {
      // Set event start to past (after-launch state)
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      process.env.NEXT_PUBLIC_EVENT_START_AT = pastDate.toISOString();
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      // Unauthenticated access to protected route should redirect to /login, NOT /prelaunch
      const request = new NextRequest(new URL("http://localhost:3000/awards"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/login");
      expect(location).not.toContain("/prelaunch");
    });

    it("falls through unchanged when env is unset (fail-open)", async () => {
      process.env.NEXT_PUBLIC_EVENT_START_AT = undefined;
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any);

      // Unauthenticated access to protected route should redirect to /login, NOT /prelaunch
      const request = new NextRequest(new URL("http://localhost:3000/awards"));
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location") || "";
      expect(location).toContain("/login");
      expect(location).not.toContain("/prelaunch");
    });

    it("allows authenticated user to access protected routes after launch", async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      process.env.NEXT_PUBLIC_EVENT_START_AT = pastDate.toISOString();
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123", email: "test@example.com" } },
          }),
        },
      } as any);

      const request = new NextRequest(new URL("http://localhost:3000/awards"));
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });
  });
});
