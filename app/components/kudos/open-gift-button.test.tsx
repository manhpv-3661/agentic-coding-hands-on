import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenGiftButton } from "./open-gift-button";

const labels = {
  openButton: "Mở Secret Box",
  heading: "KHÁM PHÁ SECRET BOX CỦA BẠN",
  subtitle: "Click vào box để mở",
  unopenedCount: "Secretbox chưa mở",
  closeAria: "Đóng hộp quà bí ẩn",
};

describe("OpenGiftButton", () => {
  it("does not show a dialog initially", () => {
    render(<OpenGiftButton labels={labels} unopenedCount={5} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the dialog on click, showing heading, subtitle and the count", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={5} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(labels.heading)).toBeInTheDocument();
    expect(screen.getByText(labels.subtitle)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("closes the dialog via the top-right X close button", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={5} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: labels.closeAria }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog on Escape (useDismissableMenu parity)", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={5} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders '0' and still opens when unopenedCount is 0 (no hidden button, no error)", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={0} />);

    const openButton = screen.getByRole("button", { name: "Mở Secret Box" });
    expect(openButton).toBeVisible();

    await user.click(openButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("does not mutate the count or add any reward/persistence side effect on open (BR-1)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<OpenGiftButton labels={labels} unopenedCount={5} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByText("5")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: labels.closeAria }));
    rerender(<OpenGiftButton labels={labels} unopenedCount={5} />);
    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
