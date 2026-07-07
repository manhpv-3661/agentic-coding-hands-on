import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyLinkButton } from "./copy-link-button";

/** `navigator.clipboard` has only a getter in jsdom — `Object.assign` can't
 * override it, so tests stub it via `Object.defineProperty` instead. */
function stubClipboard(value: { writeText: ReturnType<typeof vi.fn> } | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value,
    configurable: true,
  });
}

describe("CopyLinkButton", () => {
  it("calls navigator.clipboard.writeText with the link and shows a toast", async () => {
    // `userEvent.setup()` installs its own clipboard stub, so it must run
    // BEFORE `stubClipboard` overrides `navigator.clipboard` with our mock
    // — otherwise `setup()` clobbers it.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    render(
      <CopyLinkButton
        link="/kudos#kudos-1"
        label="Copy Link"
        copiedLabel="Link copied"
        copyFailedLabel="Copy failed"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy Link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("/kudos#kudos-1"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Link copied"));
  });

  it("clears the toast after the timeout", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });

    render(
      <CopyLinkButton
        link="/kudos#kudos-1"
        label="Copy Link"
        copiedLabel="Link copied"
        copyFailedLabel="Copy failed"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy Link" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());

    await waitFor(
      () => expect(screen.queryByRole("status")).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("shows copyFailedLabel (not copiedLabel) when the clipboard API is unavailable", async () => {
    const user = userEvent.setup();
    stubClipboard(undefined);

    render(
      <CopyLinkButton
        link="/kudos#kudos-1"
        label="Copy Link"
        copiedLabel="Link copied"
        copyFailedLabel="Copy failed"
      />,
    );

    await expect(
      user.click(screen.getByRole("button", { name: "Copy Link" })),
    ).resolves.not.toThrow();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed"));
    expect(screen.queryByText("Link copied")).not.toBeInTheDocument();
  });

  it("shows copyFailedLabel, never copiedLabel, when writeText rejects (finding M4)", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("permission denied"));
    stubClipboard({ writeText });

    render(
      <CopyLinkButton
        link="/kudos#kudos-1"
        label="Copy Link"
        copiedLabel="Link copied"
        copyFailedLabel="Copy failed"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy Link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("/kudos#kudos-1"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed"));
    expect(screen.queryByText("Link copied")).not.toBeInTheDocument();
  });
});
