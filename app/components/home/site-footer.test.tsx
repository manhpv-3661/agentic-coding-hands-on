import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ className: "font-montserrat" })),
  Montserrat_Alternates: vi.fn(() => ({ className: "font-montserrat-alternates" })),
}));

import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("scrolls to top when the logo is clicked while already on / (FR-26)", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(
      <SiteFooter
        nav={viDictionary.shared.nav}
        footer={viDictionary.shared.footer}
      />,
    );

    await user.click(
      screen.getByRole("link", { name: "Sun* Annual Awards 2025 — home" }),
    );

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("does not scroll when the logo is clicked from another page", async () => {
    mockUsePathname.mockReturnValue("/awards");
    const user = userEvent.setup();
    render(
      <SiteFooter
        nav={viDictionary.shared.nav}
        footer={viDictionary.shared.footer}
      />,
    );

    await user.click(
      screen.getByRole("link", { name: "Sun* Annual Awards 2025 — home" }),
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
