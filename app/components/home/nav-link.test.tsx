import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import { NavLink } from "./nav-link";

describe("NavLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("scrolls to top when clicking a `/` link while already on `/` (FR-7)", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(<NavLink href="/" label="About SAA 2025" selected />);

    await user.click(screen.getByRole("link", { name: "About SAA 2025" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("does not scroll when clicking a link to a different route", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(<NavLink href="/awards" label="Award Information" />);

    await user.click(screen.getByRole("link", { name: "Award Information" }));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does not scroll when the `/` link is clicked from a different page", async () => {
    mockUsePathname.mockReturnValue("/awards");
    const user = userEvent.setup();
    render(<NavLink href="/" label="About SAA 2025" selected />);

    await user.click(screen.getByRole("link", { name: "About SAA 2025" }));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
