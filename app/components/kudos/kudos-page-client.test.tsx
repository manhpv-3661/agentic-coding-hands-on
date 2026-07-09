import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Backend pivot (Phase 04/05): `addPost` calls `createKudosAction`, `toggleLike`
// calls `toggleLikeAction`. Both mocked here (not the real actions) so these
// tests exercise the optimistic-prepend/flip + rollback/reconcile wiring in
// isolation from Supabase — the real actions' own behavior is covered by
// `app/kudos/actions.test.ts`.
vi.mock("@/app/kudos/actions", () => ({
  createKudosAction: vi.fn(),
  toggleLikeAction: vi.fn(),
}));

import { createKudosAction, toggleLikeAction } from "@/app/kudos/actions";
import { KudosPageClient, type KudosPageClientProps } from "./kudos-page-client";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import type { ToggleLikeResult } from "@/lib/kudos/kudos-action-types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const dictionary = getDictionary("vi");
const mockCreateKudosAction = vi.mocked(createKudosAction);
const mockToggleLikeAction = vi.mocked(toggleLikeAction);

const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 8 };
const recipientOptions: KudosPerson[] = [{ name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 }];

const initialPosts: KudosPost[] = [
  {
    id: "kudos-1",
    sender: { name: "S1", department: "Dept A", stars: 1 },
    recipient: { name: "R1", department: "Dept B", stars: 1 },
    timestamp: "09:00 - 01/01/2026",
    content: "Existing post",
    hashtags: ["#a"],
    imageCount: 0,
    hearts: 5,
  },
];

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
  // Default: mock mode — matches today's real `createKudosAction`/
  // `toggleLikeAction` behavior when Supabase isn't configured, so
  // pre-existing tests below (which assert the classic "optimistic-only"
  // outcome) keep passing unchanged.
  mockCreateKudosAction.mockReset().mockResolvedValue({ ok: true, skipped: true });
  mockToggleLikeAction.mockReset().mockResolvedValue({ ok: true, skipped: true });
});

function renderWrapper(overrides: Partial<KudosPageClientProps> = {}) {
  render(
    <KudosPageClient
      initialPosts={initialPosts}
      currentUser={currentUser}
      recipientOptions={recipientOptions}
      labels={dictionary.kudos}
      spotlight={<div>spotlight-slot</div>}
      sidebar={<div>sidebar-slot</div>}
      {...overrides}
    />,
  );
}

describe("KudosPageClient", () => {
  it("renders the banner, board (with the existing post), spotlight and sidebar slots", () => {
    renderWrapper();

    expect(screen.getByText(dictionary.kudos.banner.title)).toBeInTheDocument();
    // "Existing post" legitimately renders twice with only 1 total post
    // (both the Highlight top-5 and the All Kudos feed share the same
    // small dataset) — assert presence, not uniqueness.
    expect(screen.getAllByText("Existing post").length).toBeGreaterThan(0);
    expect(screen.getByText("spotlight-slot")).toBeInTheDocument();
    expect(screen.getByText("sidebar-slot")).toBeInTheDocument();
  });

  it("clicking the composer pill opens the compose dialog", async () => {
    const user = userEvent.setup();
    renderWrapper();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    expect(screen.getByRole("dialog", { name: dictionary.kudos.compose.dialogTitle })).toBeInTheDocument();
  });

  it("a valid submit prepends the new Kudos so it appears first in the feed", async () => {
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }));
    await user.click(within(dialog).getByRole("option", { name: /Nguyễn Văn An/ }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Người truyền động lực",
    );
    const editor = within(dialog).getByRole("textbox", { name: dictionary.kudos.compose.content.placeholder });
    editor.textContent = "Cảm ơn bạn!";
    fireEvent.input(editor);
    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.hashtags.add }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.hashtags.placeholder),
      "teamwork{Enter}",
    );

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The new post was prepended to the wrapper's `posts` state (proves
    // `addPost`/submit wiring works end to end); precise feed ordering is
    // covered by the dedicated Phase 11 integration test with a larger,
    // unambiguous fixture set.
    expect(screen.getAllByText("Cảm ơn bạn!").length).toBeGreaterThan(0);
    // Review finding H2: the success toast is owned by `KudosPageClient`
    // (not `ComposeDialog`) and fires for the mock `{ok:true,
    // skipped:true}` case too — same "feels successful" UX as before.
    expect(await screen.findByText(dictionary.kudos.compose.successToast)).toBeInTheDocument();
  });

  it("Escape closes the compose dialog and discards the draft", async () => {
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    let dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Draft title that should not survive",
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Reopen — the draft must be gone, not silently restored.
    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
    ).toHaveValue("");
  });

  it("Escape closes only the topmost open menu — the recipient dropdown first, then the dialog", async () => {
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }),
    );
    expect(within(dialog).getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("a newly-submitted Kudos's hashtag/department become selectable in the board filters (F007)", async () => {
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }));
    await user.click(within(dialog).getByRole("option", { name: /Nguyễn Văn An/ }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Người truyền động lực",
    );
    const editor = within(dialog).getByRole("textbox", { name: dictionary.kudos.compose.content.placeholder });
    editor.textContent = "Cảm ơn bạn!";
    fireEvent.input(editor);
    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.hashtags.add }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.hashtags.placeholder),
      "newtag{Enter}",
    );

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));

    const hashtagFilter = screen.getByRole("combobox", { name: dictionary.kudos.filters.hashtagLabel });
    expect(within(hashtagFilter).getByRole("option", { name: "#newtag" })).toBeInTheDocument();

    const departmentFilter = screen.getByRole("combobox", { name: dictionary.kudos.filters.departmentLabel });
    expect(within(departmentFilter).getByRole("option", { name: currentUser.department })).toBeInTheDocument();
  });

  it("liking a post increments its heart count and toggles back on second click (F008, mock mode)", async () => {
    const user = userEvent.setup();
    renderWrapper();

    // "Existing post" is authored by "S1" (not `currentUser`), so it's
    // likeable — this proves owner state (likedIds) + prop drilling
    // (board → carousel/feed) + card render all agree end to end.
    const heartButtons = screen.getAllByRole("button", { name: dictionary.kudos.card.like });
    expect(heartButtons.length).toBeGreaterThan(0);

    await user.click(heartButtons[0]);
    expect(
      await screen.findAllByRole("button", { name: dictionary.kudos.card.unlike, pressed: true }),
    ).not.toHaveLength(0);
    expect(screen.getAllByText("6").length).toBeGreaterThan(0);
    expect(mockToggleLikeAction).toHaveBeenCalledWith("kudos-1");

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.unlike })[0]);
    await waitFor(() => {
      expect(screen.queryAllByRole("button", { name: dictionary.kudos.card.unlike })).toHaveLength(0);
    });
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("seeds likedIds from the initialLikedIds prop (F008/Phase 05 seed)", () => {
    renderWrapper({ initialLikedIds: ["kudos-1"] });

    expect(
      screen.getAllByRole("button", { name: dictionary.kudos.card.unlike, pressed: true }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("6").length).toBeGreaterThan(0);
  });

  it("Phase 05: a successful toggle reconciles to the server's authoritative liked boolean", async () => {
    mockToggleLikeAction.mockResolvedValue({ ok: true, skipped: false, liked: true });
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.like })[0]);

    expect(mockToggleLikeAction).toHaveBeenCalledWith("kudos-1");
    expect(
      await screen.findAllByRole("button", { name: dictionary.kudos.card.unlike, pressed: true }),
    ).not.toHaveLength(0);
  });

  it("Phase 05: reconciling to liked:false (server disagrees with the optimistic flip) unlikes the post", async () => {
    mockToggleLikeAction.mockResolvedValue({ ok: true, skipped: false, liked: false });
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.like })[0]);

    await waitFor(() => {
      expect(screen.queryAllByRole("button", { name: dictionary.kudos.card.unlike })).toHaveLength(0);
    });
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("Phase 05: unliking an already-liked post calls toggleLikeAction and reconciles to unliked", async () => {
    mockToggleLikeAction.mockResolvedValue({ ok: true, skipped: false, liked: false });
    const user = userEvent.setup();
    renderWrapper({ initialLikedIds: ["kudos-1"] });

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.unlike })[0]);

    expect(mockToggleLikeAction).toHaveBeenCalledWith("kudos-1");
    await waitFor(() => {
      expect(screen.queryAllByRole("button", { name: dictionary.kudos.card.unlike })).toHaveLength(0);
    });
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  it("Phase 05: a failed toggle rolls back the optimistic flip and shows the failure toast", async () => {
    mockToggleLikeAction.mockResolvedValue({ ok: false, error: "unexpected_error" });
    const user = userEvent.setup();
    renderWrapper();

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.like })[0]);

    await screen.findByText(dictionary.kudos.compose.failureToast);
    await waitFor(() => {
      expect(screen.queryAllByRole("button", { name: dictionary.kudos.card.unlike })).toHaveLength(0);
    });
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });

  async function submitComposeForm(user: ReturnType<typeof userEvent.setup>, content: string, hashtag: string) {
    await user.click(screen.getByText(dictionary.kudos.composer.placeholder));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.recipient.placeholder }));
    await user.click(within(dialog).getByRole("option", { name: /Nguyễn Văn An/ }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.title.placeholder),
      "Người truyền động lực",
    );
    const editor = within(dialog).getByRole("textbox", { name: dictionary.kudos.compose.content.placeholder });
    editor.textContent = content;
    fireEvent.input(editor);
    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.hashtags.add }));
    await user.type(
      within(dialog).getByPlaceholderText(dictionary.kudos.compose.hashtags.placeholder),
      `${hashtag}{Enter}`,
    );

    await user.click(within(dialog).getByRole("button", { name: dictionary.kudos.compose.submit }));
  }

  it("backend pivot: createKudosAction receives the serializable input mapped from the form (not the built KudosPost)", async () => {
    const user = userEvent.setup();
    renderWrapper();

    await submitComposeForm(user, "Nội dung gửi backend", "backendcheck");

    expect(mockCreateKudosAction).toHaveBeenCalledTimes(1);
    expect(mockCreateKudosAction).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Người truyền động lực",
        content: "Nội dung gửi backend",
        hashtags: ["#backendcheck"],
        recipientName: "Nguyễn Văn An",
        recipientDepartment: "Phòng Kỹ thuật",
        isAnonymous: false,
      }),
    );
  });

  it("backend pivot: a successful, non-skipped submit keeps the optimistic post (no rollback) and shows the success toast", async () => {
    mockCreateKudosAction.mockResolvedValue({ ok: true, skipped: false, postId: "kudos-server-1" });
    const user = userEvent.setup();
    renderWrapper();

    await submitComposeForm(user, "Nội dung đã lưu ở backend thật", "persisted");

    expect(screen.getAllByText("Nội dung đã lưu ở backend thật").length).toBeGreaterThan(0);
    expect(await screen.findByText(dictionary.kudos.compose.successToast)).toBeInTheDocument();
  });

  it("backend pivot: a failed submit rolls back the optimistic post, shows ONLY the failure toast, and never the success toast (review finding H2)", async () => {
    mockCreateKudosAction.mockResolvedValue({ ok: false, error: "insert_failed" });
    const user = userEvent.setup();
    renderWrapper();

    await submitComposeForm(user, "Nội dung sẽ bị rollback", "rollback");

    // Rollback: the optimistic post's content must not survive a failed
    // `createKudosAction` call, and the user must see the failure toast
    // (the existing `role="status"` timeout-toast pattern, reused) —
    // never a contradicting "success" toast first.
    await screen.findByText(dictionary.kudos.compose.failureToast);
    expect(screen.queryByText("Nội dung sẽ bị rollback")).not.toBeInTheDocument();
    expect(screen.queryByText(dictionary.kudos.compose.successToast)).not.toBeInTheDocument();
  });

  it("M1: a second click on a post while its like-toggle is already in flight is ignored (pending guard)", async () => {
    let resolveToggle: (value: ToggleLikeResult) => void = () => {};
    mockToggleLikeAction.mockImplementation(
      () =>
        new Promise<ToggleLikeResult>((resolve) => {
          resolveToggle = resolve;
        }),
    );
    renderWrapper();

    const heartButton = screen.getAllByRole("button", { name: dictionary.kudos.card.like })[0];
    // Two rapid clicks with no `await` between them (mirrors
    // `compose-dialog.test.tsx`'s own double-submit-guard test) — the
    // second click must be ignored while the first toggle is in flight.
    fireEvent.click(heartButton);
    fireEvent.click(heartButton);

    expect(mockToggleLikeAction).toHaveBeenCalledTimes(1);

    resolveToggle({ ok: true, skipped: true });
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: dictionary.kudos.card.unlike, pressed: true }).length,
      ).toBeGreaterThan(0);
    });

    // Once the first toggle resolves, a fresh click is no longer guarded.
    fireEvent.click(screen.getAllByRole("button", { name: dictionary.kudos.card.unlike })[0]);
    await waitFor(() => {
      expect(mockToggleLikeAction).toHaveBeenCalledTimes(2);
    });
  });
});
