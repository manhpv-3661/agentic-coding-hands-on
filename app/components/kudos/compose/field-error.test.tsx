import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders the given message text", () => {
    render(<FieldError>Vui lòng nhập nội dung.</FieldError>);
    expect(screen.getByText("Vui lòng nhập nội dung.")).toBeInTheDocument();
  });

  it("applies the shared identical-group style (text-xs, #CF1322)", () => {
    render(<FieldError>Thêm ít nhất 1 hashtag.</FieldError>);
    const message = screen.getByText("Thêm ít nhất 1 hashtag.");
    expect(message.tagName).toBe("P");
    expect(message).toHaveClass("text-xs", "font-semibold", "text-[#CF1322]");
  });

  it("applies the given id so a sibling control can aria-describedby it", () => {
    render(<FieldError id="compose-content-error">Vui lòng nhập nội dung.</FieldError>);
    expect(screen.getByText("Vui lòng nhập nội dung.")).toHaveAttribute("id", "compose-content-error");
  });

  it("omits the id attribute when not provided", () => {
    render(<FieldError>Vui lòng nhập nội dung.</FieldError>);
    expect(screen.getByText("Vui lòng nhập nội dung.")).not.toHaveAttribute("id");
  });
});
