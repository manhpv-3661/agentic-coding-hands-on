import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, colorFor, initials } from "./avatar";

describe("initials", () => {
  it("takes the first letter of up to 2 words, uppercased", () => {
    expect(initials("Nguyễn Văn An")).toBe("NV");
    expect(initials("Bình")).toBe("B");
  });

  it("falls back to '?' for a blank name", () => {
    expect(initials("   ")).toBe("?");
    expect(initials("")).toBe("?");
  });
});

describe("colorFor", () => {
  it("is deterministic — same name always maps to the same color", () => {
    expect(colorFor("Trần Thị Bình")).toBe(colorFor("Trần Thị Bình"));
  });

  it("returns a hex color string", () => {
    expect(colorFor("Trần Thị Bình")).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("Avatar", () => {
  it("renders initials and an accessible label for the name", () => {
    render(<Avatar name="Nguyễn Văn An" />);

    expect(screen.getByText("NV")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Nguyễn Văn An" })).toBeInTheDocument();
  });

  it("renders the same color across two instances for the same name (stable, no hydration mismatch)", () => {
    render(
      <>
        <Avatar name="Lê Hoàng Nam" />
        <Avatar name="Lê Hoàng Nam" />
      </>,
    );

    const [first, second] = screen.getAllByRole("img", { name: "Lê Hoàng Nam" });
    expect(first).toHaveStyle({ backgroundColor: second.style.backgroundColor });
  });

  it("does not render a link or button (no profile navigation)", () => {
    render(<Avatar name="Phạm Thị Hương" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
