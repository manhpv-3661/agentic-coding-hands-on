import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, colorFor, initials, photoFor } from "./avatar";

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

describe("photoFor", () => {
  it("is deterministic — same name always maps to the same photo", () => {
    expect(photoFor("Trần Thị Bình")).toBe(photoFor("Trần Thị Bình"));
  });

  it("returns one of the 3-photo mock pool for a real name", () => {
    expect(photoFor("Trần Thị Bình")).toMatch(/^\/kudos\/avatars\/avatar-[123]\.jpg$/);
  });

  it("returns null for a blank name (initials fallback instead)", () => {
    expect(photoFor("")).toBeNull();
    expect(photoFor("   ")).toBeNull();
  });
});

describe("Avatar", () => {
  it("renders a real photo (not initials) for a normal name", () => {
    render(<Avatar name="Nguyễn Văn An" />);

    const img = screen.getByRole("img", { name: "Nguyễn Văn An" });
    expect(img).toHaveAttribute("src", expect.stringContaining("avatar"));
    expect(screen.queryByText("NV")).not.toBeInTheDocument();
  });

  it("renders the same photo across two instances for the same name (stable, no hydration mismatch)", () => {
    render(
      <>
        <Avatar name="Lê Hoàng Nam" />
        <Avatar name="Lê Hoàng Nam" />
      </>,
    );

    const [first, second] = screen.getAllByRole("img", { name: "Lê Hoàng Nam" });
    expect(first.getAttribute("src")).toBe(second.getAttribute("src"));
  });

  it("falls back to initials-in-a-colored-circle for a blank name", () => {
    render(<Avatar name="" />);

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "" })).toHaveStyle({
      backgroundColor: colorFor(""),
    });
  });

  it("does not render a link or button (no profile navigation)", () => {
    render(<Avatar name="Phạm Thị Hương" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
