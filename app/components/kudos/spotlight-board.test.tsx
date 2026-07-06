import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpotlightBoard } from "./spotlight-board";

const labels = { searchPlaceholder: "Tìm kiếm", panZoom: "Pan/Zoom" };
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
});
