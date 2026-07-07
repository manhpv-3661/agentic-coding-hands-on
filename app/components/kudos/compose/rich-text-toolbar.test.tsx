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
  linkPrompt: "Đường dẫn liên kết",
  quote: "Trích dẫn",
  addLink: {
    title: "Thêm đường dẫn",
    contentLabel: "Nội dung",
    urlLabel: "URL",
    save: "Lưu",
    cancel: "Hủy",
    urlError: "Vui lòng nhập URL.",
  },
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
    expect(exec).toHaveBeenLastCalledWith("insertOrderedList");

    await user.click(screen.getByRole("button", { name: labels.quote }));
    expect(exec).toHaveBeenLastCalledWith("formatBlock", "blockquote");
  });

  it("opens the insert-link dialog (not window.prompt) when the link button is clicked", async () => {
    const exec = vi.fn();
    const promptSpy = vi.spyOn(window, "prompt");
    const user = userEvent.setup();

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));

    expect(promptSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: labels.addLink.title })).toBeInTheDocument();
  });

  it("calls exec('createLink', url) exactly once and closes the dialog on Save with a URL", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));
    await user.type(screen.getByLabelText(labels.addLink.urlLabel), "https://example.com");
    await user.click(screen.getByRole("button", { name: labels.addLink.save }));

    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledWith("createLink", "https://example.com");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an inline error and does not call exec when Save is clicked with a blank URL", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));
    await user.click(screen.getByRole("button", { name: labels.addLink.save }));

    expect(exec).not.toHaveBeenCalled();
    expect(screen.getByText(labels.addLink.urlError)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not call exec for the link button when Cancel is clicked", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();

    render(<RichTextToolbar exec={exec} labels={labels} />);
    await user.click(screen.getByRole("button", { name: labels.link }));
    await user.click(screen.getByRole("button", { name: labels.addLink.cancel }));

    expect(exec).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
