import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MentionSuggestions } from "./mention-suggestions";

const names = ["Nguyễn Văn An", "Trần Thị Bình"];

describe("MentionSuggestions", () => {
  it("renders nothing when closed", () => {
    render(<MentionSuggestions names={names} query="" onSelect={vi.fn()} open={false} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders nothing when no name matches the query", () => {
    render(<MentionSuggestions names={names} query="zzz" onSelect={vi.fn()} open />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters names by a case-insensitive substring of the query", () => {
    render(<MentionSuggestions names={names} query="bình" onSelect={vi.fn()} open />);
    expect(screen.getByRole("option", { name: "@Trần Thị Bình" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /An/ })).not.toBeInTheDocument();
  });

  it("calls onSelect with the plain name (no @) when an option is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<MentionSuggestions names={names} query="" onSelect={onSelect} open />);

    await user.click(screen.getByRole("option", { name: "@Nguyễn Văn An" }));
    expect(onSelect).toHaveBeenCalledWith("Nguyễn Văn An");
  });
});
