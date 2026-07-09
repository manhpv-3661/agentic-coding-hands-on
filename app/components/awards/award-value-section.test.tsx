import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AwardValueSection } from "./award-value-section";

/**
 * Locks in the per-call-site suffix-guard behavior preserved when the 3
 * duplicated value-row render sites (`award-value-section.tsx`) were
 * collapsed into one internal `ValueBlock` component
 * (plans/260709-1710-ui-refactor-cleanup/phase-03-awards-components-dedup.md,
 * step 1): the single-`value` fallback branch always guarded its suffix
 * line with `unit && <p>...`, while the two `valueVariants` rows never did.
 * These tests assert both behaviors are unchanged after the collapse.
 */
describe("AwardValueSection", () => {
  it("omits the suffix <p> entirely when `value.unit` is empty (fallback branch guard)", () => {
    const { container } = render(
      <AwardValueSection valueLabel="Giá trị giải thưởng: " value={{ number: "01", unit: "" }} />,
    );

    // Icon+label row is a <span>, the hero figure is one <p>; with the
    // guard applied there must be no second <p> for an empty suffix.
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent("01");
  });

  it("renders the suffix <p> when `value.unit` is non-empty (fallback branch)", () => {
    const { container } = render(
      <AwardValueSection
        valueLabel="Giá trị giải thưởng: "
        value={{ number: "7.000.000 VNĐ", unit: "cho mỗi giải thưởng" }}
      />,
    );

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[1]).toHaveTextContent("cho mỗi giải thưởng");
  });

  it("always renders both value blocks' suffix <p> for `valueVariants`, even when a suffix is empty (no guard)", () => {
    const { container } = render(
      <AwardValueSection
        valueLabel="Giá trị giải thưởng: "
        valueVariants={{
          orLabel: "Hoặc",
          individual: { value: "5.000.000 VNĐ", suffix: "" },
          collective: { value: "10.000.000 VNĐ", suffix: "cho giải tập thể" },
        }}
      />,
    );

    // Two value blocks × (hero figure + suffix line) = 4 <p> elements,
    // regardless of the individual row's suffix being an empty string —
    // `valueVariants` rows never guarded the suffix line pre-collapse.
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(4);
    expect(paragraphs[0]).toHaveTextContent("5.000.000 VNĐ");
    expect(paragraphs[1]).toHaveTextContent("");
    expect(paragraphs[2]).toHaveTextContent("10.000.000 VNĐ");
    expect(paragraphs[3]).toHaveTextContent("cho giải tập thể");
  });
});
