import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useCarousel } from "@/hooks/use-carousel";

function CarouselProbe({
  count,
  onResult,
}: {
  count: number;
  onResult: (result: ReturnType<typeof useCarousel>) => void;
}) {
  const result = useCarousel(count);
  onResult(result);
  return null;
}

describe("useCarousel", () => {
  it("starts at index 0 with canPrev false", () => {
    const onResult = vi.fn();
    render(<CarouselProbe count={5} onResult={onResult} />);

    const last = onResult.mock.calls.at(-1)![0];
    expect(last.index).toBe(0);
    expect(last.canPrev).toBe(false);
    expect(last.canNext).toBe(true);
  });

  it("advances with next() and clamps at the last slide", () => {
    const onResult = vi.fn();
    let latest: ReturnType<typeof useCarousel>;
    const capture = (r: ReturnType<typeof useCarousel>) => {
      onResult(r);
      latest = r;
    };

    render(<CarouselProbe count={2} onResult={capture} />);

    act(() => latest!.next());
    expect(onResult.mock.calls.at(-1)![0].index).toBe(1);
    expect(onResult.mock.calls.at(-1)![0].canNext).toBe(false);

    act(() => latest!.next());
    expect(onResult.mock.calls.at(-1)![0].index).toBe(1);
  });

  it("goes back with prev() and clamps at 0", () => {
    let latest: ReturnType<typeof useCarousel>;
    const capture = (r: ReturnType<typeof useCarousel>) => {
      latest = r;
    };

    render(<CarouselProbe count={3} onResult={capture} />);

    act(() => latest!.goTo(2));
    expect(latest!.index).toBe(2);

    act(() => latest!.prev());
    expect(latest!.index).toBe(1);

    act(() => latest!.prev());
    act(() => latest!.prev());
    expect(latest!.index).toBe(0);
    expect(latest!.canPrev).toBe(false);
  });

  it("resets to slide 0 when count changes (FR-16 filter change)", () => {
    let latest: ReturnType<typeof useCarousel>;
    const capture = (r: ReturnType<typeof useCarousel>) => {
      latest = r;
    };

    const { rerender } = render(<CarouselProbe count={5} onResult={capture} />);
    act(() => latest!.goTo(3));
    expect(latest!.index).toBe(3);

    rerender(<CarouselProbe count={2} onResult={capture} />);
    expect(latest!.index).toBe(0);
  });

  it("handles a count of 0 without throwing (empty state, FR-8)", () => {
    let latest: ReturnType<typeof useCarousel>;
    const capture = (r: ReturnType<typeof useCarousel>) => {
      latest = r;
    };

    expect(() => render(<CarouselProbe count={0} onResult={capture} />)).not.toThrow();
    expect(latest!.index).toBe(0);
    expect(latest!.canPrev).toBe(false);
    expect(latest!.canNext).toBe(false);
  });
});
