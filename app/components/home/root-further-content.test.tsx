import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({ className: "font-montserrat" })),
}));

import { RootFurtherContent } from "./root-further-content";

const CONTENT = {
  paragraph1: "Paragraph one.",
  pullQuote: ' "A tree with deep roots fears no storm"',
  paragraph2: "Paragraph two.",
};

describe("RootFurtherContent", () => {
  it("renders paragraph1, pullQuote, and paragraph2 from the content prop verbatim (F005)", () => {
    render(<RootFurtherContent content={CONTENT} />);

    expect(screen.getByText("Paragraph one.")).toBeInTheDocument();
    expect(screen.getByText('"A tree with deep roots fears no storm"')).toBeInTheDocument();
    expect(screen.getByText("Paragraph two.")).toBeInTheDocument();
  });

  it("renders the VI pull-quote (with back-translation parenthetical) when passed", () => {
    const viContent = {
      paragraph1: "Đoạn văn một.",
      pullQuote:
        ' "A tree with deep roots fears no storm"\n (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)',
      paragraph2: "Đoạn văn hai.",
    };

    render(<RootFurtherContent content={viContent} />);

    expect(
      screen.getByText((text) => text.includes("Ngạn ngữ Anh")),
    ).toBeInTheDocument();
  });
});
