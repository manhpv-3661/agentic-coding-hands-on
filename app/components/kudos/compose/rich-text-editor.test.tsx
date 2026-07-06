import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "./rich-text-editor";

const labels = {
  placeholder: "Viết lời cảm ơn...",
  mentionHint: 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
  counterMax: "1.000",
  error: "Vui lòng nhập nội dung.",
  toolbar: {
    bold: "In đậm",
    italic: "In nghiêng",
    strikethrough: "Gạch ngang",
    list: "Danh sách",
    link: "Chèn liên kết",
    quote: "Trích dẫn",
  },
  communityStandards: "Tiêu chuẩn cộng đồng",
};

describe("RichTextEditor", () => {
  it("renders the toolbar, mention hint, counter, and community-standards stub", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} mentionNames={[]} labels={labels} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText(labels.mentionHint)).toBeInTheDocument();
    expect(screen.getByText("0/1.000")).toBeInTheDocument();
    expect(screen.getByText("Tiêu chuẩn cộng đồng")).toBeInTheDocument();
  });

  it("updates the live counter and calls onChange as text is typed", () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} mentionNames={[]} labels={labels} />);

    const editor = screen.getByRole("textbox");
    editor.textContent = "hello";
    fireEvent.input(editor);

    expect(screen.getByText("5/1.000")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith("hello");
  });

  it("blocks further input past maxLength", () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor value="" onChange={onChange} mentionNames={[]} maxLength={5} labels={labels} />,
    );

    const editor = screen.getByRole("textbox");
    editor.textContent = "hello world";
    fireEvent.input(editor);

    expect(screen.getByText("5/1.000")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith("hello");
  });

  it("invokes document.execCommand when a toolbar button is clicked", async () => {
    // jsdom does not implement `execCommand` at all (not even a stub), so
    // it must be assigned before it can be spied on/asserted against.
    const execSpy = vi.fn().mockReturnValue(true);
    document.execCommand = execSpy;
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} mentionNames={[]} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.toolbar.bold }));
    expect(execSpy).toHaveBeenCalledWith("bold", false, undefined);
  });

  it("shows mention suggestions for a trailing @token and inserts the selected name", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RichTextEditor
        value=""
        onChange={onChange}
        mentionNames={["Nguyễn Văn An"]}
        labels={labels}
      />,
    );

    const editor = screen.getByRole("textbox");
    editor.textContent = "cảm ơn @an";
    fireEvent.input(editor);

    const option = await screen.findByRole("option", { name: "@Nguyễn Văn An" });
    await user.click(option);

    expect(onChange).toHaveBeenLastCalledWith("cảm ơn @Nguyễn Văn An ");
  });

  it("shows and inserts a mention typed in the middle of existing text, not just at the end", () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor value="" onChange={onChange} mentionNames={["Nguyễn Văn An"]} labels={labels} />,
    );

    const editor = screen.getByRole("textbox");
    editor.textContent = "chào @an bạn nhé";
    // Place the caret right after "@an" (offset 8) — simulating the user
    // having typed "@an" mid-sentence, not at the tail of the message.
    const textNode = editor.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 8);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent.input(editor);

    const option = screen.getByRole("option", { name: "@Nguyễn Văn An" });
    fireEvent.click(option);

    expect(onChange).toHaveBeenLastCalledWith("chào @Nguyễn Văn An  bạn nhé");
  });

  it("closes the mention popup on blur", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} mentionNames={["Nguyễn Văn An"]} labels={labels} />,
    );

    const editor = screen.getByRole("textbox");
    editor.textContent = "cảm ơn @an";
    fireEvent.input(editor);
    expect(screen.getByRole("option", { name: "@Nguyễn Văn An" })).toBeInTheDocument();

    fireEvent.blur(editor);
    expect(screen.queryByRole("option", { name: "@Nguyễn Văn An" })).not.toBeInTheDocument();
  });

  it("ArrowDown + Enter selects a mention suggestion instead of inserting a newline", () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor
        value=""
        onChange={onChange}
        mentionNames={["Nguyễn Văn An", "Trần Thị Bình"]}
        labels={labels}
      />,
    );

    const editor = screen.getByRole("textbox");
    editor.textContent = "cảm ơn @";
    fireEvent.input(editor);

    fireEvent.keyDown(editor, { key: "ArrowDown" });
    fireEvent.keyDown(editor, { key: "Enter" });

    expect(onChange).toHaveBeenLastCalledWith("cảm ơn @Trần Thị Bình ");
  });

  it("renders the inline error text when the error prop is set", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} mentionNames={[]} error={labels.error} labels={labels} />,
    );
    expect(screen.getByText(labels.error)).toBeInTheDocument();
  });
});
