import { describe, expect, it } from "vitest";
import { formatKudosTimestamp } from "./format-kudos-timestamp";

describe("formatKudosTimestamp", () => {
  it("zero-pads hours, minutes, month, and day", () => {
    expect(formatKudosTimestamp(new Date(2026, 0, 5, 9, 3))).toBe("09:03 - 01/05/2026");
  });

  it("does not pad a 4-digit year", () => {
    expect(formatKudosTimestamp(new Date(2025, 11, 25, 14, 30))).toBe("14:30 - 12/25/2025");
  });

  it("handles midnight", () => {
    expect(formatKudosTimestamp(new Date(2026, 5, 1, 0, 0))).toBe("00:00 - 06/01/2026");
  });
});
