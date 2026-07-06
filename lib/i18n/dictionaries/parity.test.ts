import { describe, it, expect } from "vitest";
import { vi } from "./vi";
import { en } from "./en";

/**
 * Recursively collect all keys from an object to verify key-set parity.
 * Returns a sorted array of dot-notation paths (e.g. "shared.nav.aboutSaa").
 */
function collectKeys(obj: unknown, prefix = ""): string[] {
  const keys: string[] = [];

  if (obj === null || typeof obj !== "object") {
    return keys;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (value !== null && typeof value === "object") {
        // Recurse into nested objects
        keys.push(...collectKeys(value, path));
      } else {
        // Leaf node — include the key path
        keys.push(path);
      }
    }
  }

  return keys;
}

describe("Dictionary parity", () => {
  it("VI and EN have identical key structures (parity)", () => {
    const viKeys = collectKeys(vi).sort();
    const enKeys = collectKeys(en).sort();

    expect(enKeys).toEqual(viKeys);
  });

  it("VI dictionary has all expected top-level categories", () => {
    expect(vi).toHaveProperty("shared");
    expect(vi).toHaveProperty("login");
    expect(vi).toHaveProperty("homepage");
    expect(vi).toHaveProperty("prelaunch");
    expect(vi).toHaveProperty("awards");
  });

  it("EN dictionary has all expected top-level categories", () => {
    expect(en).toHaveProperty("shared");
    expect(en).toHaveProperty("login");
    expect(en).toHaveProperty("homepage");
    expect(en).toHaveProperty("prelaunch");
    expect(en).toHaveProperty("awards");
  });

  it(
    "detects missing keys when a VI key is removed (parity test works)",
    () => {
      // Create a mutated copy of VI with a key removed to prove the test catches drift
      const mutatedVi = JSON.parse(JSON.stringify(vi));
      delete mutatedVi.shared.nav.aboutSaa;

      const viKeys = collectKeys(mutatedVi).sort();
      const enKeys = collectKeys(en).sort();

      // This should FAIL if the mutation worked, proving the test is effective
      expect(enKeys).not.toEqual(viKeys);
    }
  );
});
