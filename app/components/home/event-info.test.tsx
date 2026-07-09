import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventInfo } from "./event-info";

const EN_PROPS = {
  timeLabel: "Time:",
  venueLabel: "Venue:",
  livestreamNote: "Broadcast live via livestream",
  eventDate: "December 26, 2025",
  venueName: "Âu Cơ Art Center",
};

describe("EventInfo (FR-16)", () => {
  it("renders the eventDate prop verbatim", () => {
    render(<EventInfo {...EN_PROPS} />);
    expect(screen.getByText("December 26, 2025")).toBeInTheDocument();
  });

  it("renders event venue per Figma: Âu Cơ Art Center (proper noun, not translated)", () => {
    render(<EventInfo {...EN_PROPS} />);
    expect(screen.getByText("Âu Cơ Art Center")).toBeInTheDocument();
  });

  it("renders the livestreamNote prop verbatim", () => {
    render(<EventInfo {...EN_PROPS} />);
    expect(screen.getByText("Broadcast live via livestream")).toBeInTheDocument();
  });

  it("displays the timeLabel and venueLabel props", () => {
    render(<EventInfo {...EN_PROPS} />);
    expect(screen.getByText("Time:")).toBeInTheDocument();
    expect(screen.getByText("Venue:")).toBeInTheDocument();
  });

  it("renders locale-specific labels (VI) via props (F005)", () => {
    render(
      <EventInfo
        timeLabel="Thời gian: "
        venueLabel="Địa điểm:"
        livestreamNote="Tường thuật trực tiếp qua sóng Livestream"
        eventDate="26/12/2025"
        venueName="Âu Cơ Art Center"
      />,
    );

    expect(screen.getByText(/Thời gian:/)).toBeInTheDocument();
    expect(screen.getByText(/Địa điểm:/)).toBeInTheDocument();
    expect(screen.getByText("26/12/2025")).toBeInTheDocument();
    expect(
      screen.getByText("Tường thuật trực tiếp qua sóng Livestream"),
    ).toBeInTheDocument();
  });

  it("renders with correct styling (white labels, yellow values)", () => {
    render(<EventInfo {...EN_PROPS} />);
    const dateValue = screen.getByText("December 26, 2025");
    expect(dateValue).toHaveClass("text-[#FFEA9E]");
  });
});
