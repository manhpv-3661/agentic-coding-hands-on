import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/kudos/actions", () => ({
  openSecretBoxAction: vi.fn(async () => ({ ok: true, skipped: false, giftText: "1 áo phông SAA" })),
}));

import { OpenGiftButton } from "./open-gift-button";

const labels = {
  openButton: "Mở Secret Box",
  heading: "KHÁM PHÁ SECRET BOX CỦA BẠN",
  subtitle: "Click vào box để mở",
  unopenedCount: "Secretbox chưa mở",
  closeAria: "Đóng hộp quà bí ẩn",
  emptyState: "Bạn chưa có Secret Box nào để mở.",
  opening: "Đang mở Secret Box...",
  openedRewardPrefix: "Bạn vừa",
  openFailed: "Mở Secret Box thất bại. Vui lòng thử lại.",
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
    expect(screen.getByText("05")).toBeInTheDocument();
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

  it("renders '00' (zero-padded, per ground truth node 1466:7693) and still opens when unopenedCount is 0 (no hidden button, no error)", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={0} />);

    const openButton = screen.getByRole("button", { name: "Mở Secret Box" });
    expect(openButton).toBeVisible();

    await user.click(openButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
  });

  it("shows the empty-state message when unopenedCount is 0", async () => {
    const user = userEvent.setup();
    render(<OpenGiftButton labels={labels} unopenedCount={0} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(labels.emptyState)).toBeInTheDocument();
  });

  it("does not mutate the count or add any reward/persistence side effect on open (BR-1)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<OpenGiftButton labels={labels} unopenedCount={5} />);

    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByText("05")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: labels.closeAria }));
    rerender(<OpenGiftButton labels={labels} unopenedCount={5} />);
    await user.click(screen.getByRole("button", { name: "Mở Secret Box" }));
    expect(screen.getByText("05")).toBeInTheDocument();
  });
});
