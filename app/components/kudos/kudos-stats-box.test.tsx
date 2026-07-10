import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { KudosStatsBox } from "./kudos-stats-box";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";

const stats = { received: 24, sent: 18, hearts: 312, secretBoxOpened: 9, secretBoxUnopened: 5 };

describe("KudosStatsBox", () => {
  it("renders every stat row with its label and value", () => {
    render(
      <KudosStatsBox
        stats={stats}
        statsLabels={viDictionary.kudos.stats}
        giftLabels={viDictionary.kudos.gift}
      />,
    );

    expect(screen.getByText(viDictionary.kudos.stats.received)).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText(viDictionary.kudos.stats.secretBoxUnopened)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders the OpenGiftButton", () => {
    render(
      <KudosStatsBox
        stats={stats}
        statsLabels={viDictionary.kudos.stats}
        giftLabels={viDictionary.kudos.gift}
      />,
    );

    expect(
      screen.getByRole("button", { name: viDictionary.kudos.gift.openButton }),
    ).toBeInTheDocument();
  });

  it("renders the x2 multiplier badge next to the hearts stat only", () => {
    render(
      <KudosStatsBox
        stats={stats}
        statsLabels={viDictionary.kudos.stats}
        giftLabels={viDictionary.kudos.gift}
      />,
    );

    expect(screen.getAllByText("x2")).toHaveLength(1);
  });

  it("threads stats.secretBoxUnopened into the OpenGiftButton dialog count", async () => {
    const user = userEvent.setup();
    render(
      <KudosStatsBox
        stats={stats}
        statsLabels={viDictionary.kudos.stats}
        giftLabels={viDictionary.kudos.gift}
      />,
    );

    await user.click(screen.getByRole("button", { name: viDictionary.kudos.gift.openButton }));
    const dialog = screen.getByRole("dialog");
    // Dialog renders the count zero-padded to 2 digits (ground truth node 1466:7693 = "05"),
    // unlike the stats-box row above which shows the raw unpadded number.
    expect(
      within(dialog).getByText(String(stats.secretBoxUnopened).padStart(2, "0")),
    ).toBeInTheDocument();
  });
});
