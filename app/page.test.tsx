import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({
    variable: "--font-montserrat",
    className: "font-montserrat",
  })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
  Orbitron: vi.fn(() => ({ className: "font-orbitron" })),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/require-user";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
