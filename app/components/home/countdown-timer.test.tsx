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

const LABELS = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };
const COMING_SOON = "Coming soon";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the comingSoon subtitle when showComingSoon is true", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "05",
      hours: "03",
      minutes: "22",
      showComingSoon: true,
    });

    render(<CountdownTimer labels={LABELS} comingSoon={COMING_SOON} />);

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("hides the comingSoon subtitle when showComingSoon is false (FR-14/FR-15)", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      showComingSoon: false,
    });

    render(<CountdownTimer labels={LABELS} comingSoon={COMING_SOON} />);

    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("renders locale-specific unit labels passed via the `labels` prop (F005)", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      showComingSoon: false,
    });

    render(
      <CountdownTimer
        labels={{ days: "NGÀY", hours: "GIỜ", minutes: "PHÚT" }}
        comingSoon="Sắp diễn ra"
      />,
    );

    expect(screen.getByText("NGÀY")).toBeInTheDocument();
    expect(screen.getByText("GIỜ")).toBeInTheDocument();
    expect(screen.getByText("PHÚT")).toBeInTheDocument();
  });

  it("passes eventStartAt through to useEventCountdown (env override support)", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "00",
      hours: "00",
      minutes: "00",
      showComingSoon: false,
    });

    render(
      <CountdownTimer
        eventStartAt="2030-01-01T00:00:00Z"
        labels={LABELS}
        comingSoon={COMING_SOON}
      />,
    );

    expect(useEventCountdown).toHaveBeenCalledWith("2030-01-01T00:00:00Z");
  });

  it("renders one digit box per character of the padded value", () => {
    vi.mocked(useEventCountdown).mockReturnValue({
      days: "120",
      hours: "03",
      minutes: "05",
      showComingSoon: true,
    });

    render(<CountdownTimer labels={LABELS} comingSoon={COMING_SOON} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
