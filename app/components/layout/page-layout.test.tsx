import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ContentFrame, PageGutter } from "./page-layout";

describe("page layout primitives", () => {
  it("PageGutter owns viewport padding only", () => {
    const { container } = render(<PageGutter>content</PageGutter>);
    const element = container.firstElementChild as HTMLElement | null;

    expect(element).not.toBeNull();
    expect(element?.className).toContain("px-6");
    expect(element?.className).toContain("sm:px-10");
    expect(element?.className).toContain("lg:px-36");
    expect(element?.className).not.toContain("max-w-[");
  });

  it("ContentFrame owns max-width without re-applying page gutter", () => {
    const { container } = render(<ContentFrame width={1152}>content</ContentFrame>);
    const element = container.firstElementChild as HTMLElement | null;

    expect(element).not.toBeNull();
    expect(element?.className).toContain("mx-auto");
    expect(element?.className).toContain("max-w-[1152px]");
    expect(element?.className).not.toContain("lg:px-36");
  });
});
