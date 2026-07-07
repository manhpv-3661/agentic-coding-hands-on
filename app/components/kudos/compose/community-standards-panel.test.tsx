import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityStandardsPanel } from "./community-standards-panel";

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

function renderPanel(onClose = vi.fn(), onCompose = vi.fn()) {
  const containerRef = { current: null };
  render(<CommunityStandardsPanel labels={labels} containerRef={containerRef} onClose={onClose} onCompose={onCompose} />);
  return { onClose, onCompose };
}

describe("CommunityStandardsPanel", () => {
  it("renders the title and all 4 Hero tiers", () => {
    renderPanel();

    expect(screen.getByRole("dialog", { name: "Thể lệ" })).toBeInTheDocument();
    expect(screen.getByText("Thể lệ")).toBeInTheDocument();
    for (const tier of labels.heroTiers) {
      expect(screen.getByText(tier.name)).toBeInTheDocument();
      expect(screen.getByText(tier.condition)).toBeInTheDocument();
      expect(screen.getByText(tier.description)).toBeInTheDocument();
    }
  });

  it("renders all 6 collection icons and the national section", () => {
    renderPanel();

    for (const name of labels.collectionIcons) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText(labels.collectFullSetText)).toBeInTheDocument();
    expect(screen.getByText("KUDOS QUỐC DÂN")).toBeInTheDocument();
    expect(screen.getByText(labels.nationalText)).toBeInTheDocument();
  });

  it("splits the bundled heading+body dictionary strings into a gold heading and a body paragraph", () => {
    renderPanel();

    expect(screen.getByText("NGƯỜI NHẬN KUDOS")).toBeInTheDocument();
    expect(screen.getByText("Mô tả người nhận.")).toBeInTheDocument();
    expect(screen.getByText("NGƯỜI GỬI KUDOS")).toBeInTheDocument();
    expect(screen.getByText("Mô tả người gửi.")).toBeInTheDocument();
  });

  it('calls onClose when "Đóng" is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Đóng" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onCompose when "Viết KUDOS" is clicked', async () => {
    const user = userEvent.setup();
    const { onCompose } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Viết KUDOS" }));

    expect(onCompose).toHaveBeenCalledTimes(1);
  });

  it("is a self-contained dialog with no form fields, so opening/closing it cannot touch compose draft state", () => {
    renderPanel();

    const dialog = screen.getByRole("dialog", { name: "Thể lệ" });
    expect(within(dialog).queryAllByRole("textbox")).toHaveLength(0);
  });
});
