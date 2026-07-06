import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
