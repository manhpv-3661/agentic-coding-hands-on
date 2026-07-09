import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PlusIcon } from "./plus-icon";

describe("PlusIcon", () => {
  it("renders a decorative 24x24 svg (no accessible name of its own)", () => {
    const { container } = render(<PlusIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("draws exactly one path (the plus glyph)", () => {
    const { container } = render(<PlusIcon />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });
});
