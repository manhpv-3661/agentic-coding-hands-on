import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ className: "font-montserrat" })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

import { SunKudosSection } from "./sun-kudos-section";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { en as enDictionary } from "@/lib/i18n/dictionaries/en";

describe("SunKudosSection (spot-check translation)", () => {
  it("renders Vietnamese text when passed VI dictionary slice", () => {
    render(
      <SunKudosSection
        kudos={viDictionary.homepage.kudos}
        detailsCta={viDictionary.shared.detailsCta}
      />,
    );

    expect(screen.getByText("Phong trào ghi nhận")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
  });

  it("renders English text when passed EN dictionary slice", () => {
    render(
      <SunKudosSection
        kudos={enDictionary.homepage.kudos}
        detailsCta={enDictionary.shared.detailsCta}
      />,
    );

    expect(screen.getByText("Recognition Movement")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("renders kudos description with VI dictionary", () => {
    const { container } = render(
      <SunKudosSection
        kudos={viDictionary.homepage.kudos}
        detailsCta={viDictionary.shared.detailsCta}
      />,
    );

    // The description is a long paragraph that includes "tháng 11/2025"
    // Check the full HTML content contains the date
    expect(container.textContent).toContain("tháng 11/2025");
  });
});
