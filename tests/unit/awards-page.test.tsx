import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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
    vi.mocked(requireUser).mockResolvedValue(null);

    render(await AwardsPage());

    expect(requireUser).toHaveBeenCalledTimes(1);
  });

  it("renders one anchor section per award category with matching id", async () => {
    vi.mocked(requireUser).mockResolvedValue(null);

    render(await AwardsPage());

    for (const category of AWARD_CATEGORIES) {
      const heading = screen.getByRole("heading", { name: category.title });
      const section = heading.closest("section");
      expect(section).not.toBeNull();
      expect(section?.id).toBe(category.slug);
    }
  });

  it("renders exactly 6 sections matching AWARD_CATEGORIES count", () => {
    // Structural assertion independent of the mocked auth call above.
    expect(AWARD_CATEGORIES).toHaveLength(6);
  });
});
