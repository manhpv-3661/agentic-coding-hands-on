import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "./notification-bell";

describe("NotificationBell", () => {
  it("does not render the empty-state panel until opened", () => {
    render(<NotificationBell />);

    expect(screen.queryByText("Chưa có thông báo")).not.toBeInTheDocument();
  });

  it("shows the 'Chưa có thông báo' empty state when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByText("Chưa có thông báo")).toBeInTheDocument();
  });

  it("does not render an unread badge dot (no notification data source)", () => {
    const { container } = render(<NotificationBell />);

    expect(container.querySelector(".bg-\\[\\#D4271D\\]")).not.toBeInTheDocument();
  });

  it("closes the panel on Escape", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Chưa có thông báo")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Chưa có thông báo")).not.toBeInTheDocument();
  });
});
