import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Orbitron: vi.fn(() => ({ className: "font-orbitron" })),
}));

vi.mock("@/hooks/use-event-countdown", () => ({
  useEventCountdown: vi.fn(),
}));

import { useEventCountdown } from "@/hooks/use-event-countdown";
import { CountdownTimer } from "./countdown-timer";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the 'Comming soon' subtitle when showComingSoon is true", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "05",
      hours: "03",
      minutes: "22",
      showComingSoon: true,
    });

    render(<CountdownTimer />);

    expect(screen.getByText("Comming soon")).toBeInTheDocument();
  });

  it("hides the 'Comming soon' subtitle when showComingSoon is false (FR-14/FR-15)", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      showComingSoon: false,
    });

    render(<CountdownTimer />);

    expect(screen.queryByText("Comming soon")).not.toBeInTheDocument();
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("passes eventStartAt through to useEventCountdown (env override support)", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      showComingSoon: false,
    });

    render(<CountdownTimer eventStartAt="2030-01-01T00:00:00Z" />);

    expect(useEventCountdown).toHaveBeenCalledWith("2030-01-01T00:00:00Z");
  });

  it("renders one digit box per character of the padded value", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "120",
      hours: "03",
      minutes: "05",
      showComingSoon: true,
    });

    render(<CountdownTimer />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
