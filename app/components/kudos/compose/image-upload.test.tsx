import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageUpload } from "./image-upload";

const labels = {
  add: "+Image",
  max: "Tối đa 5",
  remove: "Xóa ảnh",
  truncated: "Đã đạt giới hạn ảnh, một số ảnh không được thêm.",
};

function makeFile(name: string) {
  return new File(["content"], name, { type: "image/png" });
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
});

describe("ImageUpload", () => {
  it("renders an add button when under the cap", () => {
    render(<ImageUpload value={[]} onChange={vi.fn()} labels={labels} />);
    expect(screen.getByRole("button", { name: "+Image" })).toBeInTheDocument();
  });

  it("appends selected files via onChange, up to the remaining capacity", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUpload value={[makeFile("a.png")]} onChange={onChange} max={2} labels={labels} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [makeFile("b.png"), makeFile("c.png")]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [files] = onChange.mock.calls[0];
    expect(files.map((f: File) => f.name)).toEqual(["a.png", "b.png"]);
  });

  it("renders a preview thumbnail per file and hides the add button at the cap", () => {
    render(
      <ImageUpload value={[makeFile("a.png"), makeFile("b.png")]} onChange={vi.fn()} max={2} labels={labels} />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Tối đa 5")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+Image" })).not.toBeInTheDocument();
  });

  it("removes a file when its remove button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUpload value={[makeFile("a.png"), makeFile("b.png")]} onChange={onChange} labels={labels} />);

    await user.click(screen.getAllByRole("button", { name: "Xóa ảnh" })[0]);
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "b.png" })]);
  });

  it("revokes object URLs when the file list changes (no leak)", () => {
    const { rerender } = render(<ImageUpload value={[makeFile("a.png")]} onChange={vi.fn()} labels={labels} />);
    rerender(<ImageUpload value={[]} onChange={vi.fn()} labels={labels} />);

    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("shows a truncation message when more files are selected than remaining capacity", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUpload value={[makeFile("a.png")]} onChange={onChange} max={2} labels={labels} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [makeFile("b.png"), makeFile("c.png")]);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "a.png" }),
      expect.objectContaining({ name: "b.png" }),
    ]);
    expect(screen.getByText(labels.truncated)).toBeInTheDocument();
  });
});
