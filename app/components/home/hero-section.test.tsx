import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Orbitron: vi.fn(() => ({ className: "font-orbitron" })),
}));

vi.mock("@/hooks/use-event-countdown", () => ({
  useEventCountdown: vi.fn(() => ({
    days: "05",
    hours: "03",
    minutes: "22",
    showComingSoon: false,
  })),
}));

import { HeroSection } from "./hero-section";

const HERO = {
  eventInfo: {
    timeLabel: "Time:",
    venueLabel: "Venue:",
    livestreamNote: "Broadcast live via livestream",
  },
  eventDate: "December 26, 2025",
  comingSoon: "Coming soon",
  cta: {
    aboutAwards: "ABOUT AWARDS",
    aboutKudos: "ABOUT KUDOS",
  },
};

const COUNTDOWN = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };

describe("HeroSection", () => {
  it("forwards hero + countdown props down to CountdownTimer, EventInfo, and HeroCtaButtons (F005)", () => {
    render(<HeroSection hero={HERO} countdown={COUNTDOWN} />);

    // CountdownTimer
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();

    // EventInfo
    expect(screen.getByText("December 26, 2025")).toBeInTheDocument();
    expect(screen.getByText("Time:")).toBeInTheDocument();
    expect(screen.getByText("Venue:")).toBeInTheDocument();
    expect(screen.getByText("Broadcast live via livestream")).toBeInTheDocument();
    // Proper noun, not sourced from dict.
    expect(screen.getByText("Âu Cơ Art Center")).toBeInTheDocument();

    // HeroCtaButtons
    expect(screen.getByRole("link", { name: /ABOUT AWARDS/ })).toHaveAttribute(
      "href",
      "/awards",
    );
    expect(screen.getByRole("link", { name: /ABOUT KUDOS/ })).toHaveAttribute(
      "href",
      "/kudos",
    );
  });
});
