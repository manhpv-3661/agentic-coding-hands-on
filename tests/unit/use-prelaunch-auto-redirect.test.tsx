import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrelaunchAutoRedirect } from "@/hooks/use-prelaunch-auto-redirect";

// Mock the hooks this hook depends on
vi.mock("@/hooks/use-event-countdown", () => ({
  useEventCountdown: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/safe-redirect", () => ({
  sanitizeInternalPath: (raw: string | null | undefined): string =>
    raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/",
}));

import { useEventCountdown } from "@/hooks/use-event-countdown";
import { useRouter, useSearchParams } from "next/navigation";

describe("usePrelaunchAutoRedirect hook", () => {
  const mockReplace = vi.fn();
  const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>;
  const mockUseEventCountdown = useEventCountdown as ReturnType<typeof vi.fn>;
  const mockUseSearchParams = useSearchParams as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    });

    mockUseSearchParams.mockReturnValue({
      get: vi.fn((key: string) => {
        if (key === "next") return null;
        return null;
      }),
    });

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does NOT call router.replace while showComingSoon is true", () => {
    mockUseEventCountdown.mockReturnValue({
      days: "01",
      hours: "12",
      minutes: "30",
      isZero: false,
      showComingSoon: true, // Still counting down
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // While counting down, no redirect should happen
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("calls router.replace with sanitized ?next when showComingSoon becomes false (BR-002)", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return "/awards";
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false, // Countdown reached zero
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // When countdown reaches zero, should redirect to the sanitized target
    expect(mockReplace).toHaveBeenCalledWith("/awards");
  });

  it("defaults to / when ?next is missing (BR-002, missing target)", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return null; // No ?next param
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // Should default to / when ?next is missing
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("sanitizes malicious ?next values", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return "//evil.com"; // Malicious
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // Sanitizer should reject //evil.com and return /
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("handles complex ?next values with query params", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return "/awards?page=1&sort=asc";
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // Should preserve the full path+query
    expect(mockReplace).toHaveBeenCalledWith("/awards?page=1&sort=asc");
  });

  it("triggers redirect immediately when showComingSoon is already false on mount", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return "/kudos";
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false, // Already false on first render
    });

    renderHook(() => usePrelaunchAutoRedirect());

    // Should fire redirect immediately
    expect(mockReplace).toHaveBeenCalledWith("/kudos");
  });

  it("does not call router.replace multiple times on re-render (dependency array correct)", () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "next") return "/todo";
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });

    const { rerender } = renderHook(() => usePrelaunchAutoRedirect());

    // Clear to verify no additional calls
    mockReplace.mockClear();

    // Rerender with same values
    rerender();

    // Should not call replace again since dependencies haven't changed
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("respects target changes in dependency array", () => {
    const mockSearchParams = {
      get: vi.fn((key: string): string | null => {
        if (key === "next") return "/awards";
        return null;
      }),
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    mockUseEventCountdown.mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      isZero: true,
      showComingSoon: false,
    });

    const { rerender } = renderHook(() => usePrelaunchAutoRedirect());

    mockReplace.mockClear();

    // Change the ?next param
    mockSearchParams.get = vi.fn((key: string): string | null => {
      if (key === "next") return "/kudos"; // Different target
      return null;
    });

    rerender();

    // Should call replace again with the new target
    expect(mockReplace).toHaveBeenCalledWith("/kudos");
  });
});
