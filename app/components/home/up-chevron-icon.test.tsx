import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UpChevronIcon } from "./up-chevron-icon";

describe("UpChevronIcon", () => {
  it("renders an SVG hidden from assistive tech", () => {
    const { container } = render(<UpChevronIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("forwards a className to the root svg element", () => {
    const { container } = render(<UpChevronIcon className="h-6 w-6" />);

    expect(container.querySelector("svg")).toHaveClass("h-6", "w-6");
  });

  it("draws the path with currentColor so callers control the icon color", () => {
    const { container } = render(<UpChevronIcon />);

    expect(container.querySelector("path")).toHaveAttribute("fill", "currentColor");
  });
});
