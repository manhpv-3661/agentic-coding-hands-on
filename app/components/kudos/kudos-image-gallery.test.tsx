import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { KudosImageGallery } from "./kudos-image-gallery";

describe("KudosImageGallery", () => {
  it("renders one tile per image up to the given count", () => {
    const { container } = render(<KudosImageGallery count={3} />);
    expect(container.querySelectorAll("[data-testid='kudos-image-tile']")).toHaveLength(3);
  });

  it("caps rendered tiles at 5 even when count is higher", () => {
    const { container } = render(<KudosImageGallery count={9} />);
    expect(container.querySelectorAll("[data-testid='kudos-image-tile']")).toHaveLength(5);
  });

  it("renders nothing when count is 0", () => {
    const { container } = render(<KudosImageGallery count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for a negative count", () => {
    const { container } = render(<KudosImageGallery count={-2} />);
    expect(container.firstChild).toBeNull();
  });
});
