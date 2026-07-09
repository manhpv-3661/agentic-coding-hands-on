import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DismissablePanel } from "./dismissable-panel";

describe("DismissablePanel", () => {
  it("renders children with the requested role and aria-label", () => {
    render(
      <DismissablePanel role="status" ariaLabel="Quick actions">
        Coming soon
      </DismissablePanel>,
    );

    const panel = screen.getByRole("status", { name: "Quick actions" });
    expect(panel).toHaveTextContent("Coming soon");
  });

  it("merges a caller-supplied className with the shared chrome classes", () => {
    render(
      <DismissablePanel role="menu" ariaLabel="Account" className="absolute top-12 right-0 z-30 w-48">
        Menu content
      </DismissablePanel>,
    );

    const panel = screen.getByRole("menu", { name: "Account" });
    expect(panel).toHaveClass(
      "rounded-lg",
      "border",
      "border-[#2E3940]",
      "bg-[#101317]",
      "shadow-lg",
      "absolute",
      "top-12",
      "right-0",
      "z-30",
      "w-48",
    );
  });
});
