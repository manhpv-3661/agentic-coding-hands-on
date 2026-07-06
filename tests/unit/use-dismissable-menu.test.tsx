import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useDismissableMenu,
  type DismissableMenuHasPopup,
} from "@/hooks/use-dismissable-menu";

function TestMenu({ haspopup }: { haspopup?: DismissableMenuHasPopup }) {
  const { open, containerRef, triggerProps, setOpen } = useDismissableMenu(
    haspopup ? { haspopup } : undefined,
  );

  return (
    <div>
      <div ref={containerRef}>
        <button {...triggerProps}>Trigger</button>
        {open && <div role="menu">Menu content</div>}
      </div>
      <button onClick={() => setOpen(false)}>Force close</button>
      <button>Outside</button>
    </div>
  );
}

describe("useDismissableMenu", () => {
  it("starts closed with aria-expanded false and default aria-haspopup menu", () => {
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("applies a custom haspopup role", () => {
    render(<TestMenu haspopup="listbox" />);

    expect(screen.getByRole("button", { name: "Trigger" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on a second trigger click (toggle)", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens via Enter/Space through native button activation", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape key while open", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when clicking outside the container", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not close when clicking inside the container", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);
    await user.click(screen.getByRole("menu"));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("exposes setOpen for imperative control", async () => {
    const user = userEvent.setup();
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Force close" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not leak document listeners once closed", async () => {
    const user = userEvent.setup();
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    render(<TestMenu />);

    const trigger = screen.getByRole("button", { name: "Trigger" });
    await user.click(trigger); // open -> attaches listeners
    const addCallsWhileOpen = addSpy.mock.calls.length;
    expect(addCallsWhileOpen).toBeGreaterThan(0);

    await user.click(trigger); // close -> detaches listeners
    expect(removeSpy).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
