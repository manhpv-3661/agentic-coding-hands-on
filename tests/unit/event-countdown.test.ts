import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  pad2,
  parseEventStart,
  computeCountdown,
  __resetWarnGuardForTests,
} from "@/lib/event-countdown";

describe("lib/event-countdown", () => {
  beforeEach(() => {
    __resetWarnGuardForTests();
  });

  describe("pad2", () => {
    it("pads single-digit numbers to 2 digits", () => {
      expect(pad2(5)).toBe("05");
      expect(pad2(0)).toBe("00");
      expect(pad2(9)).toBe("09");
    });

    it("does not truncate numbers with more than 2 digits", () => {
      expect(pad2(120)).toBe("120");
    });

    it("treats negative/NaN input as 0", () => {
      expect(pad2(-5)).toBe("00");
      expect(pad2(Number.NaN)).toBe("00");
    });
  });

  describe("parseEventStart", () => {
    it("parses a valid ISO-8601 string", () => {
      const result = parseEventStart("2025-12-31T18:30:00+07:00");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("2025-12-31T11:30:00.000Z");
    });

    it("returns null and warns for undefined input", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(parseEventStart(undefined)).toBeNull();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it("returns null and warns for an empty string", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(parseEventStart("")).toBeNull();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it("returns null and warns for a garbage string", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(parseEventStart("not-a-date")).toBeNull();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it("warns only once across repeated invalid calls", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      parseEventStart(undefined);
      parseEventStart("garbage");
      parseEventStart("");

      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it("never throws on invalid input", () => {
      expect(() => parseEventStart("garbage")).not.toThrow();
      expect(() => parseEventStart(undefined)).not.toThrow();
      expect(() => parseEventStart(null)).not.toThrow();
    });
  });

  describe("computeCountdown", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("computes padded days/hours/minutes for a future target", () => {
      const now = new Date("2026-01-01T00:00:00.000Z");
      // 5 days, 3 hours, 22 minutes ahead.
      const target = new Date(now.getTime() + (5 * 24 * 60 + 3 * 60 + 22) * 60_000);

      const state = computeCountdown(target, now);

      expect(state).toEqual({
        days: "05",
        hours: "03",
        minutes: "22",
        isZero: false,
        showComingSoon: true,
      });
    });

    it("pads values under 10 correctly (e.g. '05')", () => {
      const now = new Date("2026-01-01T00:00:00.000Z");
      const target = new Date(now.getTime() + (9 * 60 + 5) * 60_000); // 0d 9h 5m

      const state = computeCountdown(target, now);

      expect(state.days).toBe("00");
      expect(state.hours).toBe("09");
      expect(state.minutes).toBe("05");
    });

    it("returns zero-state when now equals target exactly", () => {
      const now = new Date("2026-01-01T00:00:00.000Z");

      const state = computeCountdown(now, now);

      expect(state).toEqual({
        days: "00",
        hours: "00",
        minutes: "00",
        isZero: true,
        showComingSoon: false,
      });
    });

    it("returns zero-state when target is in the past", () => {
      const now = new Date("2026-01-01T00:00:00.000Z");
      const target = new Date(now.getTime() - 60_000);

      const state = computeCountdown(target, now);

      expect(state.isZero).toBe(true);
      expect(state.showComingSoon).toBe(false);
      expect(state.days).toBe("00");
      expect(state.hours).toBe("00");
      expect(state.minutes).toBe("00");
    });

    it("returns zero-state when target is null (missing/invalid env)", () => {
      const now = new Date("2026-01-01T00:00:00.000Z");

      const state = computeCountdown(null, now);

      expect(state).toEqual({
        days: "00",
        hours: "00",
        minutes: "00",
        isZero: true,
        showComingSoon: false,
      });
    });

    it("integrates parseEventStart -> computeCountdown for invalid env without crashing", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const now = new Date("2026-01-01T00:00:00.000Z");

      const target = parseEventStart(undefined);
      const state = computeCountdown(target, now);

      expect(state.isZero).toBe(true);
      expect(state.showComingSoon).toBe(false);
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });
  });
});
