import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardsHero } from "./awards-hero";

describe("AwardsHero", () => {
  it("renders the keyvisual background image decoratively (alt='')", () => {
    const { container } = render(<AwardsHero />);

    const images = Array.from(container.querySelectorAll("img"));
    const bg = images.find((img) =>
      img.getAttribute("src")?.includes("Keyvisual-BG"),
    );
    expect(bg).toBeDefined();
    expect(bg).toHaveAttribute("alt", "");
  });

  it("renders the ROOT FURTHER logo with the FR-4 alt text (Keyvisual Sun* Annual Award 2025)", () => {
    render(<AwardsHero />);

    const logo = screen.getByAltText("Keyvisual Sun* Annual Award 2025");
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute("src")).toContain("Root-Further-Logo");
  });

  it("renders the subtitle text 'Sun* Annual Award 2025'", () => {
    render(<AwardsHero />);

    expect(screen.getByText("Sun* Annual Award 2025")).toBeInTheDocument();
  });

  it("does not render countdown, CTA, or event-info widgets (FR-4 scope)", () => {
    render(<AwardsHero />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/Thời gian:/)).not.toBeInTheDocument();
  });
});
