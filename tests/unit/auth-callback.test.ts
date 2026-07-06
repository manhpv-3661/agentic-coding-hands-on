import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: vi.fn(),
    },
  })),
}));

import { createClient } from "@/lib/supabase/server";

describe("/app/auth/callback/route.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /todo on successful code exchange", async () => {
    const mockExchange = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: mockExchange },
    } as any);

    const request = new NextRequest(
      new URL("http://localhost:3000/auth/callback?code=test-code")
    );

    const response = await GET(request);

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get("location")).toContain("/todo");
  });

  it("redirects to /login?error=auth_callback_failed on exchange error", async () => {
    const mockExchange = vi.fn().mockResolvedValue({
      error: new Error("Exchange failed"),
    });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: mockExchange },
    } as any);

    const request = new NextRequest(
      new URL("http://localhost:3000/auth/callback?code=test-code")
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/login?error=auth_callback_failed"
    );
  });

  it("redirects to /login?error=auth_callback_failed when code is missing", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/callback")
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/login?error=auth_callback_failed"
    );
  });

  it("redirects to /login?error=auth_callback_failed when code is null", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/callback?code=")
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/login?error=auth_callback_failed"
    );
  });

  it("uses next query param as redirect target if provided", async () => {
    const mockExchange = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: mockExchange },
    } as any);

    const request = new NextRequest(
      new URL(
        "http://localhost:3000/auth/callback?code=test-code&next=/custom-page"
      )
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/custom-page");
  });

  it("defaults to /todo when next param is not provided", async () => {
    const mockExchange = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: mockExchange },
    } as any);

    const request = new NextRequest(
      new URL("http://localhost:3000/auth/callback?code=test-code")
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/todo");
  });

  it("calls exchangeCodeForSession with the code from params", async () => {
    const mockExchange = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: mockExchange },
    } as any);

    const testCode = "test-code-12345";
    const request = new NextRequest(
      new URL(`http://localhost:3000/auth/callback?code=${testCode}`)
    );

    await GET(request);

    expect(mockExchange).toHaveBeenCalledWith(testCode);
  });
});
