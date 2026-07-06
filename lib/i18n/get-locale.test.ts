import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mock next/headers cookies store to return different cookie values
 * for each test case. The mock resolves to a Promise with a get() method.
 */
const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockGet,
    }),
  ),
}));

import { getLocale } from "./get-locale";

describe("getLocale", () => {
  beforeEach(() => {
    mockGet.mockClear();
  });

  it('returns "vi" when cookie NEXT_LOCALE is "vi"', async () => {
    mockGet.mockReturnValue({ value: "vi" });

    const locale = await getLocale();

    expect(locale).toBe("vi");
  });

  it('returns "en" when cookie NEXT_LOCALE is "en"', async () => {
    mockGet.mockReturnValue({ value: "en" });

    const locale = await getLocale();

    expect(locale).toBe("en");
  });

  it('returns default "vi" when cookie NEXT_LOCALE is missing', async () => {
    mockGet.mockReturnValue(undefined);

    const locale = await getLocale();

    expect(locale).toBe("vi");
  });

  it('returns default "vi" when cookie has garbage/invalid value', async () => {
    mockGet.mockReturnValue({ value: "fr" });

    const locale = await getLocale();

    expect(locale).toBe("vi");
  });
});
