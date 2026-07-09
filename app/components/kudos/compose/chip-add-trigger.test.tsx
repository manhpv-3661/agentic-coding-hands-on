import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipAddTrigger } from "./chip-add-trigger";

describe("ChipAddTrigger", () => {
  it("renders the label and max-count hint as two separate lines", () => {
    render(
      <ChipAddTrigger ariaLabel="+Hashtag" onClick={vi.fn()} label="Hashtag" max="Tối đa 5" />,
    );

    const button = screen.getByRole("button", { name: "+Hashtag" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Hashtag")).toBeInTheDocument();
    expect(screen.getByText("Tối đa 5")).toBeInTheDocument();
  });

  it("applies the given id to the button when provided", () => {
    render(
      <ChipAddTrigger id="compose-hashtags" ariaLabel="+Hashtag" onClick={vi.fn()} label="Hashtag" max="Tối đa 5" />,
    );

    expect(screen.getByRole("button", { name: "+Hashtag" })).toHaveAttribute("id", "compose-hashtags");
  });

  it("omits the id attribute when not provided", () => {
    render(<ChipAddTrigger ariaLabel="+Image" onClick={vi.fn()} label="Image" max="Tối đa 5" />);

    expect(screen.getByRole("button", { name: "+Image" })).not.toHaveAttribute("id");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ChipAddTrigger ariaLabel="+Image" onClick={onClick} label="Image" max="Tối đa 5" />);

    await user.click(screen.getByRole("button", { name: "+Image" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
