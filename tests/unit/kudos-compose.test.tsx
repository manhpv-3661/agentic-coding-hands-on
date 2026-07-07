import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ variable: "--font-montserrat", className: "font-montserrat" })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
}));

vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({ className: "font-digital-numbers" })),
}));

vi.mock("@/lib/auth/require-user", () => ({ requireUser: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(() => undefined) })),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/kudos"),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

import { requireUser } from "@/lib/auth/require-user";
import KudosPage from "@/app/kudos/page";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const dictionary = getDictionary("vi");

/**
 * End-to-end "Viết Kudos" compose flow (F007, FR-1..21), driven against the
 * REAL `/kudos` page + the REAL `KUDOS_POSTS` mock dataset (12 posts, max
 * 60 hearts) — mirrors `tests/unit/kudos-page.test.tsx`'s mocking setup.
 * A freshly-submitted post always has `hearts: 0`, so with 12 existing
 * higher-heart posts already filling the Highlight top-5, the new post is
 * guaranteed to appear ONLY in the All Kudos feed — no highlight/feed
 * duplicate-text ambiguity to work around.
 */
describe("Kudos compose flow (F007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue(null as never);
    // Patch the two blob-preview methods directly rather than replacing the
    // global `URL` constructor (`next/image`, rendered by `SiteHeader`,
    // needs the real `URL` class to remain a constructor).
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  async function fillAndOpenDialog(user: ReturnType<typeof userEvent.setup>) {
    render(await KudosPage());
    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    return screen.getByRole("dialog", { name: dictionary.kudos.compose.dialogTitle });
  }

  it("clicking the 'Ghi nhận' pill opens the Viết Kudos dialog (FR-1)", async () => {
    const user = userEvent.setup();
    const dialog = await fillAndOpenDialog(user);
    expect(dialog).toBeInTheDocument();
  });

  it("submitting with all required fields empty shows inline errors and does not close the dialog (FR-4/9/13)", async () => {
    const user = userEvent.setup();
    const dialog = await fillAndOpenDialog(user);

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));

    expect(screen.getByText(dictionary.kudos.compose.recipient.error)).toBeInTheDocument();
    expect(screen.getByText(dictionary.kudos.compose.title.error)).toBeInTheDocument();
    expect(screen.getByText(dictionary.kudos.compose.content.error)).toBeInTheDocument();
    expect(screen.getByText(dictionary.kudos.compose.hashtags.error)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("a valid submit closes the dialog, shows a success toast, and adds the post to the All Kudos feed (FR-21)", async () => {
    const user = userEvent.setup();
    const dialog = await fillAndOpenDialog(user);

    await user.click(
      within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }),
    );
    const firstOption = within(dialog).getAllByRole("option")[0];
    const recipientName = firstOption.textContent;
    await user.click(firstOption);

    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Người truyền động lực",
    );

    const editor = within(dialog).getByRole("textbox", { name: dictionary.kudos.compose.content.placeholder });
    editor.textContent = "Cảm ơn bạn đã luôn hỗ trợ team hết mình trong dự án này!";
    fireEvent.input(editor);

    await user.click(
      within(dialog).getByRole("button", { name: dictionary.kudos.compose.hashtags.add }),
    );
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.hashtags.placeholder),
      "wasshoi{Enter}",
    );

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveTextContent(dictionary.kudos.compose.successToast);

    // hearts: 0 keeps the new post out of the real dataset's Highlight
    // top-5 (max existing hearts is 60) — exactly one match confirms it
    // landed only in the All Kudos feed, at the front (prepended).
    const newCard = screen.getByText("Cảm ơn bạn đã luôn hỗ trợ team hết mình trong dự án này!");
    expect(newCard).toBeInTheDocument();
    expect(screen.getByText("Người truyền động lực")).toBeInTheDocument();
    expect(recipientName).toBeTruthy();
  });

  it("anonymous submit shows the nickname as the sender name on the new card (FR-17/18)", async () => {
    const user = userEvent.setup();
    const dialog = await fillAndOpenDialog(user);

    await user.click(
      within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }),
    );
    await user.click(within(dialog).getAllByRole("option")[0]);
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Ẩn danh nhưng ấm áp",
    );
    const editor = within(dialog).getByRole("textbox", { name: dictionary.kudos.compose.content.placeholder });
    editor.textContent = "Cảm ơn bạn rất nhiều, dù tôi không muốn lộ danh tính.";
    fireEvent.input(editor);
    await user.click(
      within(dialog).getByRole("button", { name: dictionary.kudos.compose.hashtags.add }),
    );
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.hashtags.placeholder),
      "beteam{Enter}",
    );

    await user.click(within(dialog).getByRole("checkbox"));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.anonymous.nicknamePlaceholder),
      "Doraemon",
    );

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));

    expect(screen.getByText("Doraemon")).toBeInTheDocument();
  });

  it("Escape closes the dialog and discards the draft without adding a post (FR-20)", async () => {
    const user = userEvent.setup();
    const dialog = await fillAndOpenDialog(user);

    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Draft to discard",
    );
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Draft to discard")).not.toBeInTheDocument();
  });
});
