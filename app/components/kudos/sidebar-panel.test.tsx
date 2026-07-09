import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarPanel } from "./sidebar-panel";

describe("SidebarPanel", () => {
  it("renders its children", () => {
    render(
      <SidebarPanel>
        <p>panel content</p>
      </SidebarPanel>,
    );

    expect(screen.getByText("panel content")).toBeInTheDocument();
  });

  it("applies the shared chrome classes", () => {
    render(
      <SidebarPanel>
        <p>panel content</p>
      </SidebarPanel>,
    );

    const panel = screen.getByText("panel content").parentElement;
    expect(panel?.className).toContain("rounded-[17px]");
    expect(panel?.className).toContain("border-[#998C5F]");
    expect(panel?.className).toContain("bg-[#00070C]");
  });

  it("merges a caller-supplied className onto the shared base classes", () => {
    render(
      <SidebarPanel className="items-stretch py-6 pr-2 pl-6">
        <p>panel content</p>
      </SidebarPanel>,
    );

    const panel = screen.getByText("panel content").parentElement;
    // Base chrome still present…
    expect(panel?.className).toContain("rounded-[17px]");
    // …merged with the caller's per-instance padding/alignment.
    expect(panel?.className).toContain("items-stretch");
    expect(panel?.className).toContain("py-6");
    expect(panel?.className).toContain("pr-2");
    expect(panel?.className).toContain("pl-6");
  });
});
