import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityStandardsLink } from "./community-standards-link";

const labels = {
  trigger: "Tiêu chuẩn cộng đồng",
  panelTitle: "Thể lệ",
  recipientHeading: "NGƯỜI NHẬN KUDOS\nMô tả người nhận.",
  senderHeading: "NGƯỜI GỬI KUDOS\nMô tả người gửi.",
  nationalHeading: "KUDOS QUỐC DÂN",
  heroTiers: [
    { name: "New Hero", condition: "1-4 người gửi", description: "Mô tả New Hero." },
    { name: "Rising Hero", condition: "5-9 người gửi", description: "Mô tả Rising Hero." },
    { name: "Super Hero", condition: "10-20 người gửi", description: "Mô tả Super Hero." },
    { name: "Legend Hero", condition: ">20 người gửi", description: "Mô tả Legend Hero." },
  ],
  collectionIcons: ["Revival", "Touch of Light", "Stay Gold", "Flow to Horizon", "Beyond the Boundary", "Root Further"],
  collectFullSetText: "Sưu tập trọn bộ.",
  nationalText: "Top 5 Kudos Quốc Dân.",
  footerClose: "Đóng",
  footerCompose: "Viết KUDOS",
};

describe("CommunityStandardsLink", () => {
  it("renders the trigger as a button (no href, no link role) with the panel closed by default", () => {
    render(<CommunityStandardsLink labels={labels} />);

    const el = screen.getByText("Tiêu chuẩn cộng đồng");
    expect(el.tagName.toLowerCase()).toBe("button");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens exactly one new dialog when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<CommunityStandardsLink labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog", { name: "Thể lệ" })).toBeInTheDocument();
  });

  it('closes the panel when "Đóng" is clicked', async () => {
    const user = userEvent.setup();
    render(<CommunityStandardsLink labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    await user.click(screen.getByRole("button", { name: "Đóng" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it('closes the panel when "Viết KUDOS" is clicked', async () => {
    const user = userEvent.setup();
    render(<CommunityStandardsLink labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    await user.click(screen.getByRole("button", { name: "Viết KUDOS" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes only this panel on Escape, leaving an outer dialog (e.g. the compose dialog) open", async () => {
    const user = userEvent.setup();
    render(
      <div role="dialog" aria-modal="true" aria-label="Viết Kudos">
        <CommunityStandardsLink labels={labels} />
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(2);

    await user.keyboard("{Escape}");

    // Only the panel closes — the outer "Viết Kudos" dialog stays mounted.
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog", { name: "Viết Kudos" })).toBeInTheDocument();
  });
});
