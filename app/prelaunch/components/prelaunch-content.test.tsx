import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ className: "font-montserrat" })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

import { PrelaunchContent } from "./prelaunch-content";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { en as enDictionary } from "@/lib/i18n/dictionaries/en";

describe("PrelaunchContent (spot-check translation)", () => {
  it("renders Vietnamese heading and countdown labels when passed VI dictionary", () => {
    render(
      <PrelaunchContent
        days="05"
        hours="12"
        minutes="30"
        content={{
          heading: viDictionary.prelaunch.countdown.heading,
          labels: viDictionary.shared.countdown,
        }}
      />,
    );

    expect(screen.getByText("Sự kiện sẽ bắt đầu sau")).toBeInTheDocument();
    expect(screen.getByText("NGÀY")).toBeInTheDocument();
    expect(screen.getByText("GIỜ")).toBeInTheDocument();
    expect(screen.getByText("PHÚT")).toBeInTheDocument();
  });

  it("renders English heading and countdown labels when passed EN dictionary", () => {
    render(
      <PrelaunchContent
        days="05"
        hours="12"
        minutes="30"
        content={{
          heading: enDictionary.prelaunch.countdown.heading,
          labels: enDictionary.shared.countdown,
        }}
      />,
    );

    expect(screen.getByText("The event will begin in")).toBeInTheDocument();
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("renders countdown values (digits are split into individual LED boxes)", () => {
    render(
      <PrelaunchContent
        days="05"
        hours="12"
        minutes="30"
        content={{
          heading: viDictionary.prelaunch.countdown.heading,
          labels: viDictionary.shared.countdown,
        }}
      />,
    );

    // Countdown digits are rendered as individual LED boxes, so "05" appears as separate "0" and "5"
    const renderedText = screen.getByText(/NGÀY/).parentElement?.textContent || "";
    expect(renderedText).toContain("0");
    expect(renderedText).toContain("5");
  });
});
