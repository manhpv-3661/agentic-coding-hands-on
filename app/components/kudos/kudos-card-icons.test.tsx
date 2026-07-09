import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CloseIcon, GiftIcon, PencilIcon, SearchIcon } from "./kudos-card-icons";

/** Reads the rendered `<svg>`'s `width`/`height` attributes. */
function svgDims(container: HTMLElement) {
  const svg = container.querySelector("svg");
  return { width: svg?.getAttribute("width"), height: svg?.getAttribute("height") };
}

// These icons were consolidated here from `kudos-banner.tsx`,
// `spotlight-board.tsx`, and `open-gift-button.tsx` (phase-02 dedup). Each
// assertion below pins the literal size the icon rendered at its original
// call site, so the consolidation can't silently change a visible glyph
// size (risk flagged in phase-02's plan).
describe("kudos-card-icons", () => {
  describe("PencilIcon", () => {
    it("defaults to 32px (kudos-card.tsx feed-title call site)", () => {
      const { container } = render(<PencilIcon />);
      expect(svgDims(container)).toEqual({ width: "32", height: "32" });
    });

    it("renders at 24px when the composer pill (kudos-banner.tsx) passes size={24}", () => {
      const { container } = render(<PencilIcon size={24} />);
      expect(svgDims(container)).toEqual({ width: "24", height: "24" });
    });
  });

  describe("SearchIcon", () => {
    it("defaults to 24px (kudos-banner.tsx search pill call site)", () => {
      const { container } = render(<SearchIcon />);
      expect(svgDims(container)).toEqual({ width: "24", height: "24" });
    });

    it("renders the distinct 16px glyph when the Spotlight board passes size={16}", () => {
      const { container } = render(<SearchIcon size={16} />);
      expect(svgDims(container)).toEqual({ width: "16", height: "16" });
    });
  });

  describe("GiftIcon", () => {
    it("renders at the fixed 24px size used by open-gift-button.tsx", () => {
      const { container } = render(<GiftIcon />);
      expect(svgDims(container)).toEqual({ width: "24", height: "24" });
    });
  });

  describe("CloseIcon", () => {
    it("renders at the fixed 19px size used by open-gift-button.tsx's dialog close control", () => {
      const { container } = render(<CloseIcon />);
      expect(svgDims(container)).toEqual({ width: "19", height: "19" });
    });
  });
});
