import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextToolbar } from "./rich-text-toolbar";

const labels = {
  bold: "In đậm",
  italic: "In nghiêng",
  strikethrough: "Gạch ngang",
  list: "Danh sách",
  link: "Chèn liên kết",
  quote: "Trích dẫn",
};

describe("RichTextToolbar", () => {
  it("invokes exec with the matching execCommand name for each button", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();
    render(<RichTextToolbar exec={exec} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.bold }));
    expect(exec).toHaveBeenLastCalledWith("bold");

    await user.click(screen.getByRole("button", { name: labels.italic }));
    expect(exec).toHaveBeenLastCalledWith("italic");

    await user.click(screen.getByRole("button", { name: labels.strikethrough }));
    expect(exec).toHaveBeenLastCalledWith("strikeThrough");

    await user.click(screen.getByRole("button", { name: labels.list }));
    expect(exec).toHaveBeenLastCalledWith("insertUnorderedList");

    await user.click(screen.getByRole("button", { name: labels.quote }));
    expect(exec).toHaveBeenLastCalledWith("formatBlock", "blockquote");
  });

  it("prompts for a URL and calls exec('createLink', url) when one is provided", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(window, "prompt").mockReturnValue("https://example.com");

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));

    expect(exec).toHaveBeenCalledWith("createLink", "https://example.com");
  });

  it("does not call exec for the link button when the prompt is cancelled", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(window, "prompt").mockReturnValue(null);

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));

    expect(exec).not.toHaveBeenCalled();
  });
});
