import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { KudosSidebar } from "./kudos-sidebar";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";

describe("KudosSidebar", () => {
  it("composes the stats box and the recent-recipients list", () => {
    render(
      <KudosSidebar
        stats={{ received: 24, sent: 18, hearts: 312, secretBoxOpened: 9, secretBoxUnopened: 5 }}
        recipients={[{ name: "Huỳnh Dương Xuân", gift: "Nhận được 1 áo phông SAA" }]}
        labels={viDictionary.kudos}
      />,
    );

    expect(screen.getByText(viDictionary.kudos.stats.received)).toBeInTheDocument();
    expect(screen.getByText(viDictionary.kudos.recent.heading)).toBeInTheDocument();
    expect(screen.getByText("Huỳnh Dương Xuân")).toBeInTheDocument();
  });
});
