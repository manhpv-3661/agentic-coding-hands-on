import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/font/google before importing page (site-footer/site-header/
// countdown-timer/awards-section all resolve fonts at module scope).
vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({
    variable: "--font-montserrat",
    className: "font-montserrat",
  })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
}));

const mockUsePathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mutable fixture read by the mocked `cookies()` factory — lets each test
// drive a different `NEXT_LOCALE` value without re-mocking per test (same
// pattern as tests/unit/i18n-dictionary.test.ts).
const cookieFixture = { value: undefined as string | undefined };
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "NEXT_LOCALE" && cookieFixture.value !== undefined
        ? { name, value: cookieFixture.value }
        : undefined,
  })),
}));

import { requireUser } from "@/lib/auth/require-user";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    cookieFixture.value = "en";
  });

  it("calls requireUser to guard the route (defense-in-depth alongside proxy.ts)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await HomePage());

    expect(requireUser).toHaveBeenCalledTimes(1);
  });

  it("routes the header's Award Information / Sun* Kudos nav links to real pages", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await HomePage());

    for (const link of screen.getAllByRole("link", { name: "Award Information" })) {
      expect(link).toHaveAttribute("href", "/awards");
    }
    for (const link of screen.getAllByRole("link", { name: "Sun* Kudos" })) {
      expect(link).toHaveAttribute("href", "/kudos");
    }
  });

  it("routes the hero CTAs to /awards and /kudos (FR-17)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await HomePage());

    expect(screen.getByRole("link", { name: /ABOUT AWARDS/ })).toHaveAttribute(
      "href",
      "/awards",
    );
    expect(screen.getByRole("link", { name: /ABOUT KUDOS/ })).toHaveAttribute(
      "href",
      "/kudos",
    );
  });

  it("links every award card to /awards#<slug> in AWARD_CATEGORIES order (FR-20/FR-21)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await HomePage());

    // Award cards are the only h3 headings on the page — one per category,
    // in the same order as AWARD_CATEGORIES (see awards-section.tsx).
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(AWARD_CATEGORIES.length);

    headings.forEach((heading, index) => {
      const link = heading.closest("a");
      expect(link).toHaveAttribute(
        "href",
        `/awards#${AWARD_CATEGORIES[index].slug}`,
      );
    });
  });

  it("renders Vietnamese copy by default when the NEXT_LOCALE cookie is absent (FR-4/F005)", async () => {
    cookieFixture.value = undefined;
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await HomePage());

    for (const link of screen.getAllByRole("link", {
      name: "Thông tin giải thưởng",
    })) {
      expect(link).toHaveAttribute("href", "/awards");
    }
    expect(screen.getByRole("link", { name: /VỀ GIẢI THƯỞNG/ })).toHaveAttribute(
      "href",
      "/awards",
    );
    expect(screen.getByText("NGÀY")).toBeInTheDocument();
  });
});
