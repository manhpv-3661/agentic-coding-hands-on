import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUsePathname = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/app/actions/sign-out", () => ({
  signOutAction: vi.fn(),
}));

import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("scrolls to top when the logo is clicked while already on / (FR-6)", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(
      <SiteHeader
        locale="vi"
        nav={viDictionary.shared.nav}
        account={viDictionary.shared.account}
        notifications={viDictionary.shared.notifications}
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
      <SiteHeader
        locale="vi"
        nav={viDictionary.shared.nav}
        account={viDictionary.shared.account}
        notifications={viDictionary.shared.notifications}
      />,
    );

    await user.click(
      screen.getByRole("link", { name: "Sun* Annual Awards 2025 — home" }),
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("highlights only 'Về SAA 2025' as active on / (bug fix regression)", () => {
    mockUsePathname.mockReturnValue("/");
    render(
      <SiteHeader
        locale="vi"
        nav={viDictionary.shared.nav}
        account={viDictionary.shared.account}
        notifications={viDictionary.shared.notifications}
      />,
    );

    expect(screen.getByRole("link", { name: "Về SAA 2025" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Thông tin giải thưởng" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Sun* Kudos" })).not.toHaveAttribute("aria-current");
  });

  it("highlights 'Thông tin giải thưởng' as active on /awards", () => {
    mockUsePathname.mockReturnValue("/awards");
    render(
      <SiteHeader
        locale="vi"
        nav={viDictionary.shared.nav}
        account={viDictionary.shared.account}
        notifications={viDictionary.shared.notifications}
      />,
    );

    expect(screen.getByRole("link", { name: "Thông tin giải thưởng" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Về SAA 2025" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Sun* Kudos" })).not.toHaveAttribute("aria-current");
  });

  it("highlights 'Sun* Kudos' as active on /kudos", () => {
    mockUsePathname.mockReturnValue("/kudos");
    render(
      <SiteHeader
        locale="vi"
        nav={viDictionary.shared.nav}
        account={viDictionary.shared.account}
        notifications={viDictionary.shared.notifications}
      />,
    );

    expect(screen.getByRole("link", { name: "Sun* Kudos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Về SAA 2025" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Thông tin giải thưởng" })).not.toHaveAttribute("aria-current");
  });
});
