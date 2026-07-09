import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { KudosLogoSmallIcon, PenIcon } from "./widget-button-icons";

describe("widget-button-icons", () => {
  it("renders PenIcon as a 24x24 currentColor-stroked svg", () => {
    const { container } = render(<PenIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(container.querySelector("path")).toHaveAttribute("stroke", "currentColor");
  });

  it("renders KudosLogoSmallIcon with its namespaced gradients", () => {
    const { container } = render(<KudosLogoSmallIcon />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("#saa-widget-kudos-gradient-1")).toBeInTheDocument();
    expect(container.querySelector("#saa-widget-kudos-gradient-2")).toBeInTheDocument();
  });
});
