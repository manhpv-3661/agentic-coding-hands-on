import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SpotlightTicker } from "./spotlight-ticker";

describe("SpotlightTicker", () => {
  it("renders exactly 6 fading ticker lines, each ending with the suffix", () => {
    const { container } = render(<SpotlightTicker suffix="đã nhận được một Kudos mới" />);

    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(6);
    items.forEach((item) => {
      expect(item.textContent).toContain("đã nhận được một Kudos mới");
    });
  });

  it("fades the stack from opacity 0.1 (top, oldest) down to 1 (bottom, newest)", () => {
    const { container } = render(<SpotlightTicker suffix="đã nhận được một Kudos mới" />);

    const items = Array.from(container.querySelectorAll("li"));
    const opacities = items.map((item) => item.style.opacity);
    expect(opacities).toEqual(["0.1", "0.3", "0.5", "0.7", "1", "1"]);
  });

  it("is decorative — hidden from assistive tech", () => {
    const { container } = render(<SpotlightTicker suffix="đã nhận được một Kudos mới" />);

    expect(container.querySelector("ul")).toHaveAttribute("aria-hidden", "true");
  });
});
