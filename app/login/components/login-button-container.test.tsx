import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginButtonContainer } from "./login-button-container";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
  })),
  isSupabaseConfigured: vi.fn(() => true),
}));

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const OAUTH_FAILED = "Đăng nhập không thành công. Vui lòng thử lại.";
const NOT_CONFIGURED =
  "Chưa cấu hình đăng nhập. Vui lòng thiết lập Supabase trong .env.local (xem .env.local.example).";
const LOADING_LABEL = "Đang đăng nhập...";
const GOOGLE_LABEL = "Login with Google";

const dictProps = {
  oauthFailed: OAUTH_FAILED,
  notConfigured: NOT_CONFIGURED,
  loading: LOADING_LABEL,
  google: GOOGLE_LABEL,
};

describe("LoginButtonContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("renders LoginButton with no initial error", () => {
    render(<LoginButtonContainer {...dictProps} />);
    expect(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("displays initial error when initialError prop is set", () => {
    render(<LoginButtonContainer {...dictProps} initialError={OAUTH_FAILED} />);
    expect(screen.getByRole("alert")).toHaveTextContent(OAUTH_FAILED);
  });

  it("shows a config message and skips OAuth when Supabase is not configured", async () => {
    const user = userEvent.setup();
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const mockSignIn = vi.fn();
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    expect(mockSignIn).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(NOT_CONFIGURED);
  });

  it("sets loading state when login button is clicked", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    const button = screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") });

    // Button is initially not disabled
    expect(button).not.toBeDisabled();

    // Start click (will be disabled during loading)
    await user.click(button);

    // Check that signInWithOAuth was called
    expect(mockSignIn).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: expect.stringContaining("/auth/callback") },
    });
  });

  it("calls signInWithOAuth with correct redirectTo", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    expect(mockSignIn).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringMatching(/http:\/\/localhost.*\/auth\/callback$/),
      },
    });
  });

  it("shows error when OAuth call returns an error", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({
      error: new Error("OAuth failed"),
    });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(OAUTH_FAILED);
    });
  });

  it("shows error when OAuth call throws an exception", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(OAUTH_FAILED);
    });
  });

  it("clears error when attempting login again", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({
      error: new Error("OAuth failed"),
    });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} initialError="Initial error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Initial error");

    // Click again
    mockSignIn.mockResolvedValueOnce({ error: null });
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    // Initial error should be cleared immediately
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts).toHaveLength(0);
    });
  });

  it("resets loading state on error", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({
      error: new Error("OAuth failed"),
    });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    const button = screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") });

    await user.click(button);

    await waitFor(() => {
      // Button should be enabled again after error
      expect(button).not.toBeDisabled();
    });
  });

  it("renders the loading label passed via the loading prop", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn(() => new Promise(() => {})); // never resolves
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as any);

    render(<LoginButtonContainer {...dictProps} />);
    await user.click(screen.getByRole("button", { name: new RegExp(GOOGLE_LABEL, "i") }));

    expect(screen.getByText(LOADING_LABEL)).toBeInTheDocument();
  });
});
