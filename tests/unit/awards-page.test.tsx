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
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/require-user";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import AwardsPage from "@/app/awards/page";

describe("AwardsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls requireUser to guard the route", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await AwardsPage());

    expect(requireUser).toHaveBeenCalledTimes(1);
  });

  it("renders the title section caption and gold heading (FR-5)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await AwardsPage());

    expect(screen.getByText("Sun* annual awards 2025")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Hệ thống giải thưởng SAA 2025" }),
    ).toBeInTheDocument();
  });

  it("renders one anchor section per award category with matching id, in order", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    const { container } = render(await AwardsPage());

    // Card titles differ from `AWARD_CATEGORIES` labels (e.g. MVP renders as
    // "MVP (Most Valuable Person)", see `award-detail-data.ts`), so sections
    // are located by id rather than by heading text. Scoped to
    // `.scroll-mt-24` (the catalog's own anchor sections, `awards-catalog.tsx`)
    // to exclude `SunKudosSection`'s unrelated `#kudos-section`.
    const sectionIds = Array.from(
      container.querySelectorAll("section.scroll-mt-24[id]"),
    ).map((section) => section.id);

    expect(sectionIds).toEqual(AWARD_CATEGORIES.map((category) => category.slug));
  });

  it("renders exactly 6 sections matching AWARD_CATEGORIES count", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    const { container } = render(await AwardsPage());

    expect(container.querySelectorAll("section.scroll-mt-24[id]")).toHaveLength(6);
    expect(AWARD_CATEGORIES).toHaveLength(6);
  });

  it("renders the Sun* Kudos section before the footer (FR-15)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    const { container } = render(await AwardsPage());

    const kudosSection = container.querySelector("#kudos-section");
    const footer = container.querySelector("footer");
    expect(kudosSection).not.toBeNull();
    expect(footer).not.toBeNull();
    // DOM order: kudos section must precede the footer.
    expect(
      kudosSection!.compareDocumentPosition(footer!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
