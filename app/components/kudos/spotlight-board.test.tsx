import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpotlightBoard } from "./spotlight-board";

const labels = {
  searchPlaceholder: "Tìm kiếm",
  panZoom: "Pan/Zoom",
  tickerSuffix: "đã nhận được một Kudos mới",
};
const names = ["Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Nam"];

describe("SpotlightBoard", () => {
  it("renders the total KUDOS counter", () => {
    render(<SpotlightBoard names={names} total={388} labels={labels} />);
    expect(screen.getByText("388 KUDOS")).toBeInTheDocument();
  });

  it("renders the heading and every name", () => {
    render(<SpotlightBoard names={names} total={388} labels={labels} />);
    expect(screen.getByRole("heading", { name: "SPOTLIGHT BOARD" })).toBeInTheDocument();
    names.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument());
  });

  it("caps the search input at 100 characters (FR-11)", () => {
    render(<SpotlightBoard names={names} total={388} labels={labels} />);
    expect(screen.getByPlaceholderText("Tìm kiếm")).toHaveAttribute("maxLength", "100");
  });

  it("typing a substring highlights the matching name (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<SpotlightBoard names={names} total={388} labels={labels} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm"), "an");

    expect(screen.getByText("Nguyễn Văn An")).toHaveAttribute("data-matched", "true");
    expect(screen.getByText("Trần Thị Bình")).toHaveAttribute("data-matched", "false");
  });

  it("toggles the Pan/Zoom visual state", async () => {
    const user = userEvent.setup();
    render(<SpotlightBoard names={names} total={388} labels={labels} />);

    const toggle = screen.getByRole("button", { name: "Pan/Zoom" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the bottom ticker with 6 fading lines", () => {
    const { container } = render(<SpotlightBoard names={names} total={388} labels={labels} />);
    expect(container.querySelectorAll("li")).toHaveLength(6);
  });

  it("renders the decorative collage backdrop", () => {
    // Phase 07 fix: the backdrop no longer renders an `<img>` — the previous
    // `spotlight-crop.png` baked ~120 interactive names into pixels under
    // the real DOM name-cloud (duplicate names + asset-rule violation).
    // It is now a CSS-only decorative layer (inlined into `spotlight-board.tsx`,
    // phase-02 dedup), so this asserts the `aria-hidden` backdrop container
    // renders instead.
    const { container } = render(<SpotlightBoard names={names} total={388} labels={labels} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("renders the search icon at 16px (phase-02 consolidation: not 24px default)", () => {
    // Phase 02 found and fixed a regression: SearchIcon was defaulting to 24px
    // in spotlight-board when the ground-truth design calls for 16px (to match
    // the pill's proportions). This test locks in the explicit size={16} call.
    const { container } = render(<SpotlightBoard names={names} total={388} labels={labels} />);
    const svg = container.querySelector("input[placeholder='Tìm kiếm']")?.parentElement?.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });
});
