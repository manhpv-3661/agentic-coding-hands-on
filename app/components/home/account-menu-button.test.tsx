import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/actions/sign-out", () => ({
  signOutAction: vi.fn(),
}));

import { signOutAction } from "@/app/actions/sign-out";
import { AccountMenuButton } from "./account-menu-button";

describe("AccountMenuButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the menu on trigger click and shows Profile + Sign out only", async () => {
    const user = userEvent.setup();
    render(<AccountMenuButton />);

    await user.click(screen.getByRole("button", { name: "Account menu" }));

    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
  });

  it("calls signOutAction when Sign out is clicked", async () => {
    const user = userEvent.setup();
    render(<AccountMenuButton />);

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(signOutAction).toHaveBeenCalledTimes(1);
  });

  it("does not navigate when Profile is clicked (stub)", async () => {
    const user = userEvent.setup();
    render(<AccountMenuButton />);

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Profile" }));

    expect(signOutAction).not.toHaveBeenCalled();
  });

  it("closes the menu on Escape", async () => {
    const user = userEvent.setup();
    render(<AccountMenuButton />);

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menuitem", { name: "Profile" })).not.toBeInTheDocument();
  });
});
