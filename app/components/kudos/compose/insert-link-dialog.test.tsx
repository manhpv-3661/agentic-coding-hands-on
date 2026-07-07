import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsertLinkDialog } from "./insert-link-dialog";

const labels = {
  title: "Thêm đường dẫn",
  contentLabel: "Nội dung",
  urlLabel: "URL",
  save: "Lưu",
  cancel: "Hủy",
  urlError: "Vui lòng nhập URL.",
};

describe("InsertLinkDialog", () => {
  it("renders nothing when closed", () => {
    render(<InsertLinkDialog open={false} onCancel={vi.fn()} onSave={vi.fn()} labels={labels} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the two labeled fields and Hủy/Lưu actions when open", () => {
    render(<InsertLinkDialog open onCancel={vi.fn()} onSave={vi.fn()} labels={labels} />);

    expect(screen.getByRole("dialog", { name: labels.title })).toBeInTheDocument();
    expect(screen.getByLabelText(labels.contentLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(labels.urlLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: labels.cancel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: labels.save })).toBeInTheDocument();
  });

  it("calls onSave with the trimmed url and the content when Save is clicked with a URL", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<InsertLinkDialog open onCancel={vi.fn()} onSave={onSave} labels={labels} />);

    await user.type(screen.getByLabelText(labels.contentLabel), "Docs");
    await user.type(screen.getByLabelText(labels.urlLabel), "  https://example.com  ");
    await user.click(screen.getByRole("button", { name: labels.save }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("https://example.com", "Docs");
  });

  it("shows an inline error and does not call onSave when the URL is blank", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<InsertLinkDialog open onCancel={vi.fn()} onSave={onSave} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.save }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(labels.urlError)).toBeInTheDocument();
  });

  it("treats a whitespace-only URL as blank", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<InsertLinkDialog open onCancel={vi.fn()} onSave={onSave} labels={labels} />);

    await user.type(screen.getByLabelText(labels.urlLabel), "   ");
    await user.click(screen.getByRole("button", { name: labels.save }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(labels.urlError)).toBeInTheDocument();
  });

  it("clears a previous error once the user edits the URL field again", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<InsertLinkDialog open onCancel={vi.fn()} onSave={onSave} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.save }));
    expect(screen.getByText(labels.urlError)).toBeInTheDocument();

    await user.type(screen.getByLabelText(labels.urlLabel), "h");
    expect(screen.queryByText(labels.urlError)).not.toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<InsertLinkDialog open onCancel={onCancel} onSave={vi.fn()} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.cancel }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("resets fields after the dialog is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <InsertLinkDialog open onCancel={vi.fn()} onSave={vi.fn()} labels={labels} />,
    );

    await user.type(screen.getByLabelText(labels.urlLabel), "https://example.com");
    rerender(<InsertLinkDialog open={false} onCancel={vi.fn()} onSave={vi.fn()} labels={labels} />);
    rerender(<InsertLinkDialog open onCancel={vi.fn()} onSave={vi.fn()} labels={labels} />);

    expect(screen.getByLabelText(labels.urlLabel)).toHaveValue("");
  });
});
