import { describe, expect, it } from "vitest";
import { GOLD_GLOW_BOX_SHADOW, GOLD_GLOW_TEXT_SHADOW } from "./gold-glow";

describe("gold-glow constants", () => {
  it("GOLD_GLOW_BOX_SHADOW matches the literal copied from widget-button.tsx", () => {
    expect(GOLD_GLOW_BOX_SHADOW).toBe(
      "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287",
    );
  });

  it("GOLD_GLOW_TEXT_SHADOW matches the literal copied from nav-link.tsx", () => {
    expect(GOLD_GLOW_TEXT_SHADOW).toBe(
      "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287",
    );
  });
});
