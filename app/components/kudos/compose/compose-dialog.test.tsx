import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComposeDialog } from "./compose-dialog";
import type { KudosPerson } from "@/lib/kudos/kudos-types";

const labels = {
  dialogTitle: "Viết Kudos",
  cancel: "Hủy",
  submit: "Gửi",
  successToast: "Đã gửi Kudos!",
  recipient: { label: "Người nhận", placeholder: "Chọn người nhận", search: "Tìm đồng nghiệp", error: "Vui lòng chọn người nhận." },
  title: { label: "Danh hiệu", placeholder: "Dành tặng một danh hiệu cho đồng đội.", helper: "Ví dụ...", error: "Vui lòng nhập danh hiệu." },
  content: {
    label: "Nội dung",
    placeholder: "Viết lời cảm ơn...",
    mentionHint: 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
    counterMax: "1.000",
    error: "Vui lòng nhập nội dung.",
    toolbar: { bold: "In đậm", italic: "In nghiêng", strikethrough: "Gạch ngang", list: "Danh sách", link: "Chèn liên kết", quote: "Trích dẫn" },
    communityStandards: "Tiêu chuẩn cộng đồng",
  },
  hashtags: { label: "Hashtag", placeholder: "Nhập hashtag", add: "+Hashtag", max: "Tối đa 5", error: "Thêm ít nhất 1 hashtag.", remove: "Xóa hashtag" },
  images: { label: "Image", add: "+Image", max: "Tối đa 5", remove: "Xóa ảnh" },
  anonymous: { checkbox: "Gửi lời cảm ơn và ghi nhận ẩn danh", nicknameLabel: "Nickname ẩn danh", nicknamePlaceholder: "Doraemon", error: "Vui lòng nhập nickname." },
};

const recipientOptions: KudosPerson[] = [{ name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 }];
const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 8 };

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

function renderDialog(onSubmit = vi.fn(), onClose = vi.fn()) {
  const containerRef = { current: null };
  render(
    <ComposeDialog
      open
      containerRef={containerRef}
      onClose={onClose}
      onSubmit={onSubmit}
      recipientOptions={recipientOptions}
      mentionNames={recipientOptions.map((p) => p.name)}
      currentUser={currentUser}
      labels={labels}
    />,
  );
  return { onSubmit, onClose };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /chọn người nhận/i }));
  await user.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }));

  await user.type(screen.getByPlaceholderText("Dành tặng một danh hiệu cho đồng đội."), "Người truyền động lực");

  const editor = screen.getByRole("textbox", { name: "Viết lời cảm ơn..." });
  editor.textContent = "Cảm ơn bạn rất nhiều!";
  fireEvent.input(editor);

  await user.type(screen.getByPlaceholderText("Nhập hashtag"), "teamwork{Enter}");
}

describe("ComposeDialog", () => {
  it("renders nothing (no dialog panel) when open is false", () => {
    const containerRef = { current: null };
    render(
      <ComposeDialog
        open={false}
        containerRef={containerRef}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        recipientOptions={recipientOptions}
        mentionNames={[]}
        currentUser={currentUser}
        labels={labels}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog with all fields when open", () => {
    renderDialog();
    expect(screen.getByRole("dialog", { name: "Viết Kudos" })).toBeInTheDocument();
  });

  it("submitting with all fields empty shows inline errors and does not call onSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    expect(screen.getByText("Vui lòng chọn người nhận.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập danh hiệu.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập nội dung.")).toBeInTheDocument();
    expect(screen.getByText("Thêm ít nhất 1 hashtag.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("a valid submit calls onSubmit with the built post, closes, and shows a toast", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const post = onSubmit.mock.calls[0][0];
    expect(post.recipient).toEqual(recipientOptions[0]);
    expect(post.sender).toEqual(currentUser);
    expect(post.title).toBe("Người truyền động lực");
    expect(post.content).toBe("Cảm ơn bạn rất nhiều!");
    expect(post.hashtags).toEqual(["#teamwork"]);
    expect(post.hearts).toBe(0);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent("Đã gửi Kudos!");
  });

  it("anonymous submit uses the nickname as sender", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByPlaceholderText("Doraemon"), "Doraemon");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    const post = onSubmit.mock.calls[0][0];
    expect(post.sender).toEqual({ name: "Doraemon", department: "", stars: 0 });
  });

  it("cancel closes the dialog without calling onSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
