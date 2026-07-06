import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunityStandardsLink } from "./community-standards-link";

describe("CommunityStandardsLink", () => {
  it("renders the label as a static, non-navigating button (no href, no link role)", () => {
    render(<CommunityStandardsLink label="Tiêu chuẩn cộng đồng" />);

    const el = screen.getByText("Tiêu chuẩn cộng đồng");
    expect(el.tagName.toLowerCase()).toBe("button");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
