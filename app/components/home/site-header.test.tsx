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
});
