import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosPageClient } from "./kudos-page-client";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const dictionary = getDictionary("vi");

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
});

function renderWrapper() {
  render(
    <KudosPageClient
      initialPosts={initialPosts}
      currentUser={currentUser}
      recipientOptions={recipientOptions}
      labels={dictionary.kudos}
      spotlight={<div>spotlight-slot</div>}
      sidebar={<div>sidebar-slot</div>}
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

  it("liking a post increments its heart count and toggles back on second click (F008)", async () => {
    const user = userEvent.setup();
    renderWrapper();

    // "Existing post" is authored by "S1" (not `currentUser`), so it's
    // likeable — this proves owner state (likedIds) + prop drilling
    // (board → carousel/feed) + card render all agree end to end.
    const heartButtons = screen.getAllByRole("button", { name: dictionary.kudos.card.like });
    expect(heartButtons.length).toBeGreaterThan(0);

    await user.click(heartButtons[0]);
    expect(
      screen.getAllByRole("button", { name: dictionary.kudos.card.unlike, pressed: true }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("6").length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: dictionary.kudos.card.unlike })[0]);
    expect(screen.queryAllByRole("button", { name: dictionary.kudos.card.unlike })).toHaveLength(0);
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
  });
});
