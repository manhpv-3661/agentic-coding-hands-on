import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnonymousToggle } from "./anonymous-toggle";

const labels = {
  checkbox: "Gửi lời cảm ơn và ghi nhận ẩn danh",
  nicknameLabel: "Nickname ẩn danh",
  nicknamePlaceholder: "Doraemon",
  error: "Vui lòng nhập nickname.",
};

describe("AnonymousToggle", () => {
  it("hides the nickname field when unchecked", () => {
    render(
      <AnonymousToggle
        checked={false}
        onCheckedChange={vi.fn()}
        nickname=""
        onNicknameChange={vi.fn()}
        labels={labels}
      />,
    );

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("reveals the required nickname field when checked", () => {
    render(
      <AnonymousToggle
        checked={true}
        onCheckedChange={vi.fn()}
        nickname=""
        onNicknameChange={vi.fn()}
        labels={labels}
      />,
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("Nickname ẩn danh")).toBeInTheDocument();
  });

  it("calls onCheckedChange when the checkbox is toggled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AnonymousToggle
        checked={false}
        onCheckedChange={onCheckedChange}
        nickname=""
        onNicknameChange={vi.fn()}
        labels={labels}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders the inline nickname error when checked and nicknameError is set", () => {
    render(
      <AnonymousToggle
        checked={true}
        onCheckedChange={vi.fn()}
        nickname=""
        onNicknameChange={vi.fn()}
        nicknameError={labels.error}
        labels={labels}
      />,
    );

    expect(screen.getByText(labels.error)).toBeInTheDocument();
  });
});
