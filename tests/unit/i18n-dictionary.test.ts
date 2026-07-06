import { describe, it, expect, vi, beforeEach } from "vitest";

// Mutable fixture read by the mocked `cookies()` factory below — lets each
// test drive a different `NEXT_LOCALE` value without re-mocking per test.
const cookieFixture = { value: undefined as string | undefined };

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "NEXT_LOCALE" && cookieFixture.value !== undefined
        ? { name, value: cookieFixture.value }
        : undefined,
  })),
}));

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { en as enDictionary } from "@/lib/i18n/dictionaries/en";

describe("lib/i18n/get-dictionary", () => {
  it('returns the Vietnamese dictionary object for locale "vi"', () => {
    expect(getDictionary("vi")).toBe(viDictionary);
    expect(getDictionary("vi").shared.detailsCta).toBe("Chi tiết");
  });

  it('returns the English dictionary object for locale "en"', () => {
    expect(getDictionary("en")).toBe(enDictionary);
    expect(getDictionary("en").shared.detailsCta).toBe("Details");
  });
});

describe("lib/i18n/get-locale", () => {
  beforeEach(() => {
    cookieFixture.value = undefined;
  });

  it('defaults to "vi" when the NEXT_LOCALE cookie is missing', async () => {
    expect(await getLocale()).toBe("vi");
  });

  it('defaults to "vi" when the cookie holds an invalid/garbage value', async () => {
    cookieFixture.value = "fr";
    expect(await getLocale()).toBe("vi");
  });

  it('defaults to "vi" when the cookie value is a case-mismatched "EN"', async () => {
    cookieFixture.value = "EN";
    expect(await getLocale()).toBe("vi");
  });

  it('returns "en" only when the cookie is exactly "en"', async () => {
    cookieFixture.value = "en";
    expect(await getLocale()).toBe("en");
  });
});
