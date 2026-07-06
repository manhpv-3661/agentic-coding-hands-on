import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signOutAction } from "./sign-out";

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs out via Supabase and redirects to /login when configured", async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue({
      auth: { signOut: mockSignOut },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await signOutAction();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login without touching Supabase when not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    await signOutAction();

    expect(createClient).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("calls signOut before redirect", async () => {
    const callOrder: string[] = [];
    const mockSignOut = vi.fn().mockImplementation(async () => {
      callOrder.push("signOut");
      return { error: null };
    });
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue({
      auth: { signOut: mockSignOut },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
    vi.mocked(redirect).mockImplementation(() => {
      callOrder.push("redirect");
      return undefined as never;
    });

    await signOutAction();

    expect(callOrder).toEqual(["signOut", "redirect"]);
  });
});
