import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCtaButtons } from "./hero-cta-buttons";

describe("HeroCtaButtons", () => {
  it("renders the aboutAwards/aboutKudos label props verbatim (F005)", () => {
    render(<HeroCtaButtons aboutAwards="VỀ GIẢI THƯỞNG" aboutKudos="VỀ SUN* KUDOS" />);

    expect(screen.getByText("VỀ GIẢI THƯỞNG")).toBeInTheDocument();
    expect(screen.getByText("VỀ SUN* KUDOS")).toBeInTheDocument();
  });

  it("routes to /awards and /kudos by default (FR-17)", () => {
    render(<HeroCtaButtons aboutAwards="ABOUT AWARDS" aboutKudos="ABOUT KUDOS" />);

    expect(screen.getByRole("link", { name: /ABOUT AWARDS/ })).toHaveAttribute(
      "href",
      "/awards",
    );
    expect(screen.getByRole("link", { name: /ABOUT KUDOS/ })).toHaveAttribute(
      "href",
      "/kudos",
    );
  });

  it("honors custom href overrides", () => {
    render(
      <HeroCtaButtons
        aboutAwards="ABOUT AWARDS"
        aboutKudos="ABOUT KUDOS"
        aboutAwardsHref="/custom-awards"
        aboutKudosHref="/custom-kudos"
      />,
    );

    expect(screen.getByRole("link", { name: /ABOUT AWARDS/ })).toHaveAttribute(
      "href",
      "/custom-awards",
    );
    expect(screen.getByRole("link", { name: /ABOUT KUDOS/ })).toHaveAttribute(
      "href",
      "/custom-kudos",
    );
  });
});
