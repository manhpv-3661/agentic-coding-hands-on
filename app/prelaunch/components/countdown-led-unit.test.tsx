import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "--font-montserrat", className: "font-montserrat" })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

import { CountdownLedUnit } from "./countdown-led-unit";

describe("CountdownLedUnit", () => {
  it("renders a normal 2-digit zero-padded value as-is", () => {
    render(<CountdownLedUnit value="05" label="DAYS" unit="days" />);

    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("clamps a 3-digit day count to the fixed 2-box display instead of fabricating a wrong number", () => {
    // Regression: `value.slice(-2)` used to turn "120" into "20" — a real,
    // different (wrong) number rather than a safe cap.
    render(<CountdownLedUnit value="120" label="DAYS" unit="days" />);

    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    const boxes = screen.getAllByText("9");
    expect(boxes).toHaveLength(2);
  });

  it("clamps values that would otherwise render as near-zero (e.g. 100, 200) to '99'", () => {
    // Regression: `value.slice(-2)` turned both "100" and "200" into "00",
    // which looks like the event is starting immediately.
    const { unmount } = render(<CountdownLedUnit value="100" label="DAYS" unit="days" />);
    expect(screen.getAllByText("9")).toHaveLength(2);
    unmount();

    render(<CountdownLedUnit value="200" label="DAYS" unit="days" />);
    expect(screen.getAllByText("9")).toHaveLength(2);
  });

  it("falls back to '00' for a non-numeric value instead of crashing", () => {
    render(<CountdownLedUnit value="" label="DAYS" unit="days" />);

    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  // MoMorph TC f98adad8-f486-4c5b-be69-3dce92c92af0 (Unit HOURS, "Range 00 to
  // 23"): -1, 0, 12, 23, 25 -> "00" for the out-of-range inputs, the value
  // as-is otherwise. Hours is derived via modulo arithmetic upstream and can
  // never legitimately fall outside 00-23, so an out-of-range value resets
  // to "00" instead of clamping to "23" (unlike Days, which is unbounded).
  it("resets an out-of-range Hours value to '00' instead of clamping to 23", () => {
    const { unmount: unmountNegative } = render(
      <CountdownLedUnit value="-1" label="HOURS" unit="hours" />,
    );
    expect(screen.getAllByText("0")).toHaveLength(2);
    unmountNegative();

    const { unmount: unmountOver } = render(
      <CountdownLedUnit value="25" label="HOURS" unit="hours" />,
    );
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    unmountOver();
  });

  it("renders in-range Hours values as-is (0, 12, 23)", () => {
    const { unmount: unmount0 } = render(<CountdownLedUnit value="0" label="HOURS" unit="hours" />);
    expect(screen.getAllByText("0")).toHaveLength(2);
    unmount0();

    const { unmount: unmount12 } = render(
      <CountdownLedUnit value="12" label="HOURS" unit="hours" />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    unmount12();

    render(<CountdownLedUnit value="23" label="HOURS" unit="hours" />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // MoMorph TC 724e6e17-1b9f-4bad-8baa-b48ad9e178be (Unit MINUTES, "Range 00
  // to 59"): -1, 0, 30, 59, 60 -> "00" for the out-of-range inputs.
  it("resets an out-of-range Minutes value to '00' instead of clamping to 59", () => {
    const { unmount: unmountNegative } = render(
      <CountdownLedUnit value="-1" label="MINUTES" unit="minutes" />,
    );
    expect(screen.getAllByText("0")).toHaveLength(2);
    unmountNegative();

    render(<CountdownLedUnit value="60" label="MINUTES" unit="minutes" />);
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("renders an in-range Minutes value as-is (59)", () => {
    render(<CountdownLedUnit value="59" label="MINUTES" unit="minutes" />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });
});
