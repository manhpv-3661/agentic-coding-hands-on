import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WidgetButton } from "./widget-button";

describe("WidgetButton", () => {
  it("toggles aria-expanded via the shared dismissable-menu hook", async () => {
    const user = userEvent.setup();
    render(<WidgetButton comingSoon="Coming soon" />);

    const trigger = screen.getByRole("button", { name: "Quick actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<WidgetButton comingSoon="Coming soon" />);

    const trigger = screen.getByRole("button", { name: "Quick actions" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the comingSoon prop inside the stub panel when open (F005)", async () => {
    const user = userEvent.setup();
    render(<WidgetButton comingSoon="Sắp ra mắt" />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Quick actions" });
    await user.click(trigger);

    const panel = screen.getByRole("status", { name: "Quick actions" });
    expect(panel).toHaveTextContent("Sắp ra mắt");
  });
});
