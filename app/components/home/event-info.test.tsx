import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventInfo } from "./event-info";

describe("EventInfo (FR-16)", () => {
  it("renders event date per Figma: 26/12/2025", () => {
    render(<EventInfo />);
    expect(screen.getByText("26/12/2025")).toBeInTheDocument();
  });

  it("renders event venue per Figma: Âu Cơ Art Center", () => {
    render(<EventInfo />);
    expect(screen.getByText("Âu Cơ Art Center")).toBeInTheDocument();
  });

  it("renders livestream note per Figma: Tường thuật trực tiếp qua sóng Livestream", () => {
    render(<EventInfo />);
    expect(
      screen.getByText("Tường thuật trực tiếp qua sóng Livestream")
    ).toBeInTheDocument();
  });

  it("displays all event info labels (Thời gian, Địa điểm)", () => {
    render(<EventInfo />);
    expect(screen.getByText(/Thời gian:/)).toBeInTheDocument();
    expect(screen.getByText(/Địa điểm:/)).toBeInTheDocument();
  });

  it("renders with correct styling (white labels, yellow values)", () => {
    render(<EventInfo />);
    const dateValue = screen.getByText("26/12/2025");
    expect(dateValue).toHaveClass("text-[#FFEA9E]");
  });
});
