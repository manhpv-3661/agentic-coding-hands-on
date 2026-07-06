import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/app/actions/sign-out", () => ({
  signOutAction: vi.fn(),
}));

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("scrolls to top when the logo is clicked while already on / (FR-6)", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(
      screen.getByRole("link", { name: "Sun* Annual Awards 2025 — home" }),
    );

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("does not scroll when the logo is clicked from another page", async () => {
    mockUsePathname.mockReturnValue("/awards");
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(
      screen.getByRole("link", { name: "Sun* Annual Awards 2025 — home" }),
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
