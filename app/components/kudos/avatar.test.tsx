import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

// `initials`/`colorFor`/`photoFor` are internal to `avatar.tsx` (phase-02
// dedup — they had no consumer besides this file). Their behavior is
// exercised entirely through `Avatar`'s rendered output below. Note: any
// non-blank `name` always resolves a mock photo (`photoFor` only returns
// `null` for a blank/whitespace-only name), so the multi-word
// letter-extraction branch of `initials` is only ever reached with a blank
// name (always "?") — there is currently no real-name input that renders
// initials through the public `Avatar` API.
describe("Avatar", () => {
  it("renders a real photo (not initials) for a normal name", () => {
    render(<Avatar name="Nguyễn Văn An" />);

    const img = screen.getByRole("img", { name: "Nguyễn Văn An" });
    expect(img).toHaveAttribute("src", expect.stringContaining("avatar"));
    expect(screen.queryByText("NV")).not.toBeInTheDocument();
  });

  it("picks a photo from the 3-photo mock pool for a real name", () => {
    render(<Avatar name="Trần Thị Bình" />);

    const img = screen.getByRole("img", { name: "Trần Thị Bình" });
    expect(img.getAttribute("src")).toMatch(/avatar-[123]\.jpg/);
  });

  it("renders the same photo across two instances for the same name (stable, deterministic hash, no hydration mismatch)", () => {
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

    const fallback = screen.getByRole("img", { name: "" });
    expect(fallback).toHaveTextContent("?");
    expect(fallback.style.backgroundColor).toBeTruthy();
  });

  it("treats a whitespace-only name the same as an empty name (same initials + color)", () => {
    render(
      <>
        <Avatar name="" />
        <Avatar name="   " />
      </>,
    );

    const [empty, whitespace] = screen.getAllByRole("img", { name: "" });
    expect(whitespace).toHaveTextContent("?");
    expect(whitespace.style.backgroundColor).toBe(empty.style.backgroundColor);
  });

  it("does not render a link or button (no profile navigation)", () => {
    render(<Avatar name="Phạm Thị Hương" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
