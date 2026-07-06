import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// `countdown-led-unit.tsx` (rendered by `PrelaunchContent`) loads the
// `Orbitron` Google Font at module scope, which isn't available under
// vitest's jsdom environment — stub it the same way `awards-page.test.tsx`
// stubs `Montserrat`.
vi.mock("next/font/google", () => ({
  Orbitron: vi.fn(() => ({ className: "font-orbitron" })),
}));

import { PrelaunchContent } from "@/app/prelaunch/components/prelaunch-content";
import { vi as viDictionary } from "@/lib/i18n/dictionaries/vi";
import { en as enDictionary } from "@/lib/i18n/dictionaries/en";

describe("PrelaunchContent", () => {
  it("renders the VI heading and shared countdown labels from the content prop", () => {
    const content = {
      heading: viDictionary.prelaunch.countdown.heading,
      labels: viDictionary.shared.countdown,
    };

    render(<PrelaunchContent days="01" hours="02" minutes="03" content={content} />);

    expect(
      screen.getByText(viDictionary.prelaunch.countdown.heading),
    ).toBeInTheDocument();
    expect(screen.getByText(viDictionary.shared.countdown.days)).toBeInTheDocument();
    expect(screen.getByText(viDictionary.shared.countdown.hours)).toBeInTheDocument();
    expect(screen.getByText(viDictionary.shared.countdown.minutes)).toBeInTheDocument();
  });

  it("renders the EN heading and shared countdown labels from the content prop", () => {
    const content = {
      heading: enDictionary.prelaunch.countdown.heading,
      labels: enDictionary.shared.countdown,
    };

    render(<PrelaunchContent days="01" hours="02" minutes="03" content={content} />);

    expect(
      screen.getByText(enDictionary.prelaunch.countdown.heading),
    ).toBeInTheDocument();
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("never renders the old hardcoded English unit labels when given VI content", () => {
    const content = {
      heading: viDictionary.prelaunch.countdown.heading,
      labels: viDictionary.shared.countdown,
    };

    render(<PrelaunchContent days="01" hours="02" minutes="03" content={content} />);

    expect(screen.queryByText("DAYS")).not.toBeInTheDocument();
    expect(screen.queryByText("HOURS")).not.toBeInTheDocument();
    expect(screen.queryByText("MINUTES")).not.toBeInTheDocument();
  });

  it("still renders the zero-padded digit values passed in as props", () => {
    const content = {
      heading: viDictionary.prelaunch.countdown.heading,
      labels: viDictionary.shared.countdown,
    };

    const { container } = render(
      <PrelaunchContent days="07" hours="12" minutes="45" content={content} />,
    );

    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("7");
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("5");
  });
});
