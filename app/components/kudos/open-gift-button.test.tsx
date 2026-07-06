import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenGiftButton } from "./open-gift-button";

const labels = {
  openButton: "Mở Secret Box",
  dialogTitle: "Secret Box của bạn",
  dialogBody: "body",
  close: "Đóng",
};

describe("OpenGiftButton", () => {
  it("does not show a dialog initially", () => {
    render(<OpenGiftButton labels={labels} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the dialog on click and closes it via the close button", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Secret Box của bạn")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
