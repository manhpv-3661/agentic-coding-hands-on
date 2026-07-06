import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashtagInput } from "./hashtag-input";

const labels = { placeholder: "Nhập hashtag", add: "+Hashtag", max: "Tối đa 5", error: "Thêm ít nhất 1 hashtag.", remove: "Xóa hashtag" };

describe("HashtagInput", () => {
  it("adds a chip via the add button and auto-prefixes '#'", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HashtagInput value={[]} onChange={onChange} labels={labels} />);

    await user.type(screen.getByPlaceholderText("Nhập hashtag"), "teamwork");
    await user.click(screen.getByRole("button", { name: "+Hashtag" }));

    expect(onChange).toHaveBeenCalledWith(["#teamwork"]);
  });

  it("adds a chip via Enter and does not double-prefix an existing '#'", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HashtagInput value={[]} onChange={onChange} labels={labels} />);

    await user.type(screen.getByPlaceholderText("Nhập hashtag"), "#wasshoi{Enter}");

    expect(onChange).toHaveBeenCalledWith(["#wasshoi"]);
  });

  it("ignores a case-insensitive duplicate", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HashtagInput value={["#Teamwork"]} onChange={onChange} labels={labels} />);

    await user.type(screen.getByPlaceholderText("Nhập hashtag"), "teamwork{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables adding and shows the max label once at the cap", () => {
    render(
      <HashtagInput
        value={["#a", "#b", "#c", "#d", "#e"]}
        onChange={vi.fn()}
        labels={labels}
      />,
    );

    expect(screen.getByText("Tối đa 5")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Nhập hashtag")).not.toBeInTheDocument();
  });

  it("removes a chip when its X button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HashtagInput value={["#a", "#b"]} onChange={onChange} labels={labels} />);

    const removeButtons = screen.getAllByRole("button", { name: "Xóa hashtag" });
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(["#b"]);
  });

  it("renders the inline error text when the error prop is set", () => {
    render(<HashtagInput value={[]} onChange={vi.fn()} error={labels.error} labels={labels} />);
    expect(screen.getByText(labels.error)).toBeInTheDocument();
  });
});
