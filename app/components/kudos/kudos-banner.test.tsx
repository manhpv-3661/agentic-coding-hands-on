import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosBanner } from "./kudos-banner";

const labels = {
  title: "Hệ thống ghi nhận và cảm ơn",
  searchPlaceholder: "Tìm kiếm profile Sunner",
};
const composer = { placeholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" };

describe("KudosBanner", () => {
  it("renders the banner title, the KUDOS wordmark, and the composer placeholder", () => {
    render(<KudosBanner labels={labels} composer={composer} />);

    expect(screen.getByText("Hệ thống ghi nhận và cảm ơn")).toBeInTheDocument();
    expect(screen.getByText("KUDOS")).toBeInTheDocument();
    expect(
      screen.getByText("Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"),
    ).toBeInTheDocument();
  });

  it("renders the search pill placeholder from the dictionary, inert but not natively disabled (avoids a browser default disabled-button paint that rendered as a duplicate pill)", () => {
    render(<KudosBanner labels={labels} composer={composer} />);

    const searchPill = screen.getByText("Tìm kiếm profile Sunner").closest("button");
    expect(searchPill).not.toBeNull();
    expect(searchPill).not.toBeDisabled();
    expect(searchPill).toHaveAttribute("aria-disabled", "true");
    expect(searchPill).toHaveAttribute("tabIndex", "-1");
    expect(searchPill?.className).toContain("pointer-events-none");
  });

  it("the composer pill is inert when composerTriggerProps is omitted (F006 default)", async () => {
    const user = userEvent.setup();
    render(<KudosBanner labels={labels} composer={composer} />);

    const pill = screen.getByText("Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?").closest("button");
    expect(pill).not.toBeNull();
    await user.click(pill as HTMLButtonElement);
    // No throw, no assertion target — the pill has no handler wired.
  });

  it("clicking the pill fires the supplied composerTriggerProps.onClick (F007)", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <KudosBanner
        labels={labels}
        composer={composer}
        composerTriggerProps={{ onClick, "aria-expanded": false, "aria-haspopup": "dialog" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hôm nay/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
