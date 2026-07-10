import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

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

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
    }),
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
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

    // "Sun* Annual Awards 2025" legitimately renders twice on this page:
    // once as AwardsHero's keyvisual subtitle, once as the title section's
    // own eyebrow caption (mm:313:8453/313:8454) — both centered per ground
    // truth. Assert the title-section instance specifically via its heading
    // sibling rather than an ambiguous getByText across the whole page.
    const heading = screen.getByRole("heading", { name: "Hệ thống giải thưởng SAA 2025" });
    expect(heading).toBeInTheDocument();
    const titleSection = heading.parentElement;
    expect(titleSection).not.toBeNull();
    expect(
      within(titleSection as HTMLElement).getByText("Sun* Annual Awards 2025"),
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

  it("caps the title-and-catalog content at 1152px inside the page-gutter wrapper", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    const { container } = render(await AwardsPage());
    const wrapper = container.querySelector("main > div");

    expect(wrapper).not.toBeNull();
    // PageGutter (outer) owns only the 144px viewport gutter — it must never
    // also own max-width (single-owner rule, momorph-layout-system.md).
    // Desktop-only fix (plans/260709-0724-desktop-only-banner-overlay-fix):
    // the gutter is flat at every width now, no `lg:` prefix.
    expect(wrapper?.className).toContain("px-36");
    expect(wrapper?.className).not.toContain("max-w-[1152px]");
    // ContentFrame (nested) owns the 1152px cap so content doesn't stretch
    // unbounded past the native 1440px frame (phase-06-awards-screen.md).
    expect(wrapper?.firstElementChild?.className).toContain("max-w-[1152px]");
  });
});
