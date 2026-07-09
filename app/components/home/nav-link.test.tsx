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

  it("defaults to the header variant's rounded-pill inactive styling", () => {
    mockUsePathname.mockReturnValue("/");
    render(<NavLink href="/awards" label="Award Information" />);

    const link = screen.getByRole("link", { name: "Award Information" });
    expect(link).toHaveClass("rounded-[4px]", "text-white");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("renders the footer variant with square corners and larger type", () => {
    mockUsePathname.mockReturnValue("/");
    render(<NavLink href="/awards" label="Award Information" variant="footer" />);

    const link = screen.getByRole("link", { name: "Award Information" });
    expect(link).toHaveClass("rounded-none", "text-base");
    expect(link).not.toHaveClass("rounded-[4px]");
  });

  it("applies the footer variant's active-state background + gold glow when selected", () => {
    mockUsePathname.mockReturnValue("/awards");
    render(<NavLink href="/awards" label="Award Information" selected variant="footer" />);

    const link = screen.getByRole("link", { name: "Award Information" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("bg-[#FFEA9E]/10");
    expect(link).toHaveStyle({ textShadow: "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287" });
  });

  it("still wires scroll-to-top-on-home-click for the footer variant", async () => {
    mockUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(<NavLink href="/" label="About SAA 2025" selected variant="footer" />);

    await user.click(screen.getByRole("link", { name: "About SAA 2025" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
