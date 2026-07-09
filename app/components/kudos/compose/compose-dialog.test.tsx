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
  failureToast: "Gửi Kudos thất bại. Vui lòng thử lại.",
  recipient: { label: "Người nhận", placeholder: "Tìm kiếm", search: "Tìm đồng nghiệp", error: "Vui lòng chọn người nhận." },
  title: { label: "Danh hiệu", placeholder: "Dành tặng một danh hiệu cho đồng đội", helper: "Ví dụ...", error: "Vui lòng nhập danh hiệu." },
  content: {
    label: "Nội dung",
    placeholder: "Viết lời cảm ơn...",
    mentionHint: 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
    counterMax: "1.000",
    error: "Vui lòng nhập nội dung.",
    toolbar: {
      bold: "In đậm", italic: "In nghiêng", strikethrough: "Gạch ngang", list: "Danh sách",
      link: "Chèn liên kết", linkPrompt: "Đường dẫn liên kết", quote: "Trích dẫn",
      addLink: { title: "Thêm đường dẫn", contentLabel: "Nội dung", urlLabel: "URL", save: "Lưu", cancel: "Hủy", urlError: "Vui lòng nhập URL." },
    },
  },
  // Moved out of `content` (Phase 1, FR-23) — `trigger` is the label this
  // dialog's stub button has always shown; the rest is Phase 3's panel copy,
  // not exercised by this dialog's own tests.
  communityStandards: {
    trigger: "Tiêu chuẩn cộng đồng", panelTitle: "Thể lệ", recipientHeading: "", senderHeading: "",
    nationalHeading: "", heroTiers: [], collectionIcons: [], collectFullSetText: "", nationalText: "",
    footerClose: "Đóng", footerCompose: "Viết KUDOS",
  },
  hashtags: { label: "Hashtag", placeholder: "Nhập hashtag", add: "+Hashtag", max: "Tối đa 5", error: "Thêm ít nhất 1 hashtag.", remove: "Xóa hashtag" },
  images: {
    label: "Image",
    add: "+Image",
    max: "Tối đa 5",
    remove: "Xóa ảnh",
    truncated: "Đã đạt giới hạn ảnh, một số ảnh không được thêm.",
  },
  anonymous: { checkbox: "Gửi lời cảm ơn và ghi nhận ẩn danh", nicknameLabel: "Nickname ẩn danh", nicknamePlaceholder: "Doraemon", error: "Vui lòng nhập nickname." },
};

const recipientOptions: KudosPerson[] = [{ name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 }];

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
      labels={labels}
    />,
  );
  return { onSubmit, onClose };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /tìm kiếm/i }));
  await user.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }));

  await user.type(screen.getByPlaceholderText("Dành tặng một danh hiệu cho đồng đội"), "Người truyền động lực");

  const editor = screen.getByRole("textbox", { name: "Viết lời cảm ơn..." });
  editor.textContent = "Cảm ơn bạn rất nhiều!";
  fireEvent.input(editor);

  await user.click(screen.getByRole("button", { name: "+Hashtag" }));
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

  it("clears a field's inline error as soon as its value changes, without waiting for re-submit", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(screen.getByText("Vui lòng nhập danh hiệu.")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Dành tặng một danh hiệu cho đồng đội"), "X");
    expect(screen.queryByText("Vui lòng nhập danh hiệu.")).not.toBeInTheDocument();
    // Untouched fields keep their error until their own value changes.
    expect(screen.getByText("Vui lòng nhập nội dung.")).toBeInTheDocument();
  });

  it("a valid submit calls onSubmit with the raw form state and closes (no toast — ownership moved to KudosPageClient, review finding H2)", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // onSubmit now receives the raw, validated `ComposeFormState` (not a
    // built `KudosPost`) — the wrapper builds both the optimistic post AND
    // the action input from this same state (backend pivot, Phase 04).
    const state = onSubmit.mock.calls[0][0];
    expect(state.recipient).toEqual(recipientOptions[0]);
    expect(state.title).toBe("Người truyền động lực");
    expect(state.content).toBe("Cảm ơn bạn rất nhiều!");
    expect(state.hashtags).toEqual(["#teamwork"]);

    expect(onClose).toHaveBeenCalledTimes(1);
    // This dialog no longer shows a success toast itself — it doesn't know
    // whether `createKudosAction` actually succeeded yet. `KudosPageClient`
    // is the sole toast owner now (see `kudos-page-client.test.tsx`).
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("anonymous submit passes anonymous:true and the nickname in the form state", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByPlaceholderText("Doraemon"), "Doraemon");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    const state = onSubmit.mock.calls[0][0];
    expect(state.anonymous).toBe(true);
    expect(state.nickname).toBe("Doraemon");
  });

  it("two rapid submit clicks on a valid form produce exactly one onSubmit call (double-submit guard)", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderDialog();

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", { name: "Gửi" });
    // Fire both clicks synchronously (no `await` between them) to
    // simulate the two-clicks-in-one-tick race the guard protects
    // against — `userEvent.click` awaits its own event dispatch, so two
    // sequential `await`s would let React settle in between and never
    // actually race.
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cancel closes the dialog without calling onSubmit", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("preserves the draft (title + content) across opening and closing the Community Standards panel (FR-23 edge case: panel is a sibling overlay, never a remount of the compose form)", async () => {
    const user = userEvent.setup();
    renderDialog();

    const titleInput = screen.getByPlaceholderText("Dành tặng một danh hiệu cho đồng đội");
    await user.type(titleInput, "Người truyền động lực");
    const editor = screen.getByRole("textbox", { name: "Viết lời cảm ơn..." });
    editor.textContent = "Cảm ơn bạn rất nhiều!";
    fireEvent.input(editor);

    await user.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    expect(screen.getByRole("dialog", { name: "Thể lệ" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog", { name: "Thể lệ" })).not.toBeInTheDocument();

    expect(titleInput).toHaveValue("Người truyền động lực");
    expect(editor.textContent).toBe("Cảm ơn bạn rất nhiều!");
  });
});
