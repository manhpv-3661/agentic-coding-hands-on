import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardsHero } from "./awards-hero";
import type { Dictionary } from "@/lib/i18n/dictionary";

const dictionary = {
  awards: {
    title: {
      heading: "Hệ thống giải thưởng SAA 2025",
    },
  },
} as Dictionary;

describe("AwardsHero", () => {
  it("renders the keyvisual background image decoratively (alt='')", () => {
    const { container } = render(<AwardsHero dictionary={dictionary} />);

    const images = Array.from(container.querySelectorAll("img"));
    const bg = images.find((img) =>
      img.getAttribute("src")?.includes("Keyvisual-BG"),
    );
    expect(bg).toBeDefined();
    expect(bg).toHaveAttribute("alt", "");
  });

  it("renders the ROOT FURTHER logo with the FR-4 alt text (Keyvisual Sun* Annual Awards 2025)", () => {
    render(<AwardsHero dictionary={dictionary} />);

    const logo = screen.getByAltText("Keyvisual Sun* Annual Awards 2025");
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute("src")).toContain("Root-Further-Logo");
  });

  it("renders the subtitle text 'Sun* Annual Awards 2025'", () => {
    render(<AwardsHero dictionary={dictionary} />);

    expect(screen.getByText("Sun* Annual Awards 2025")).toBeInTheDocument();
  });

  it("does not render countdown, CTA, or event-info widgets (FR-4 scope)", () => {
    render(<AwardsHero dictionary={dictionary} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/Thời gian:/)).not.toBeInTheDocument();
  });
});
