import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";
import { vi } from "./dictionaries/vi";
import { en } from "./dictionaries/en";

describe("getDictionary", () => {
  it('returns the Vietnamese dictionary when locale is "vi"', async () => {
    const dict = getDictionary("vi");

    expect(dict).toEqual(vi);
  });

  it('returns the English dictionary when locale is "en"', async () => {
    const dict = getDictionary("en");

    expect(dict).toEqual(en);
  });

  it('contains the expected shared navigation keys', () => {
    const dict = getDictionary("vi");

    expect(dict.shared.nav).toHaveProperty("aboutSaa");
    expect(dict.shared.nav).toHaveProperty("awardInfo");
    expect(dict.shared.nav).toHaveProperty("kudos");
  });

  it('contains the expected shared account keys', () => {
    const dict = getDictionary("vi");

    expect(dict.shared.account).toHaveProperty("profile");
    expect(dict.shared.account).toHaveProperty("signOut");
  });

  it('contains the expected shared notification keys', () => {
    const dict = getDictionary("vi");

    expect(dict.shared.notifications).toHaveProperty("empty");
  });

  it('returns distinct objects for each locale', () => {
    const viDict = getDictionary("vi");
    const enDict = getDictionary("en");

    // They should be different objects (different translations)
    expect(viDict.shared.nav.aboutSaa).not.toBe(enDict.shared.nav.aboutSaa);
    expect(viDict.shared.account.profile).not.toBe(enDict.shared.account.profile);
  });
});
