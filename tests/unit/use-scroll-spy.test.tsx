import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render } from "@testing-library/react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: ObserverCallback;
  observed: Element[] = [];
  disconnected = false;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve(target: Element) {
    this.observed = this.observed.filter((node) => node !== target);
  }

  disconnect() {
    this.disconnected = true;
  }

  trigger(entries: Array<{ target: Element; isIntersecting: boolean }>) {
    this.callback(entries as unknown as IntersectionObserverEntry[]);
  }
}

function fireEntries(
  observer: MockIntersectionObserver,
  updates: Record<string, boolean>,
) {
  act(() => {
    observer.trigger(
      Object.entries(updates).map(([id, isIntersecting]) => ({
        target: document.getElementById(id) as Element,
        isIntersecting,
      })),
    );
  });
}

function ScrollSpyProbe({
  ids,
  onActiveIdChange,
}: {
  ids: string[];
  onActiveIdChange: (activeId: string | null) => void;
}) {
  const activeId = useScrollSpy(ids);
  onActiveIdChange(activeId);
  return <div data-testid="active-id">{activeId ?? "none"}</div>;
}

function renderSections(ids: string[]) {
  const container = document.createElement("div");
  for (const id of ids) {
    const section = document.createElement("section");
    section.id = id;
    container.appendChild(section);
  }
  document.body.appendChild(container);
  return () => container.remove();
}

describe("useScrollSpy", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("reports the intersecting section, preferring order on ties", () => {
    const cleanup = renderSections(["one", "two", "three"]);
    const onActiveIdChange = vi.fn();
    render(
      <ScrollSpyProbe
        ids={["one", "two", "three"]}
        onActiveIdChange={onActiveIdChange}
      />,
    );

    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observed).toHaveLength(3);

    fireEntries(observer, { two: true });
    expect(onActiveIdChange).toHaveBeenLastCalledWith("two");

    // Both "one" and "two" intersecting at once -> "one" wins because it is
    // first in the given `ids` order (deterministic tie-break, FR-8).
    fireEntries(observer, { one: true, two: true });
    expect(onActiveIdChange).toHaveBeenLastCalledWith("one");

    cleanup();
  });

  it("returns null when nothing intersects yet", () => {
    const cleanup = renderSections(["one", "two"]);
    const onActiveIdChange = vi.fn();
    render(
      <ScrollSpyProbe ids={["one", "two"]} onActiveIdChange={onActiveIdChange} />,
    );

    expect(onActiveIdChange).toHaveBeenLastCalledWith(null);

    cleanup();
  });

  it("returns null and creates no observer when ids is empty", () => {
    const onActiveIdChange = vi.fn();
    render(<ScrollSpyProbe ids={[]} onActiveIdChange={onActiveIdChange} />);

    expect(onActiveIdChange).toHaveBeenLastCalledWith(null);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("skips ids with no matching DOM node without throwing (FR-10)", () => {
    const cleanup = renderSections(["real"]);
    const onActiveIdChange = vi.fn();

    expect(() =>
      render(
        <ScrollSpyProbe
          ids={["missing", "real"]}
          onActiveIdChange={onActiveIdChange}
        />,
      ),
    ).not.toThrow();

    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observed).toHaveLength(1);

    fireEntries(observer, { real: true });
    expect(onActiveIdChange).toHaveBeenLastCalledWith("real");

    cleanup();
  });

  it("returns null and creates no observer when every id is missing from the DOM", () => {
    const onActiveIdChange = vi.fn();
    render(
      <ScrollSpyProbe ids={["ghost"]} onActiveIdChange={onActiveIdChange} />,
    );

    expect(onActiveIdChange).toHaveBeenLastCalledWith(null);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("disconnects the observer on unmount", () => {
    const cleanup = renderSections(["one"]);
    const { unmount } = render(
      <ScrollSpyProbe ids={["one"]} onActiveIdChange={vi.fn()} />,
    );

    const observer = MockIntersectionObserver.instances[0];
    expect(observer.disconnected).toBe(false);

    unmount();

    expect(observer.disconnected).toBe(true);
    cleanup();
  });

  it("does nothing (no throw, no observer) when IntersectionObserver is unavailable", () => {
    vi.unstubAllGlobals();
    const globalWithIO = globalThis as { IntersectionObserver?: unknown };
    const originalIO = globalWithIO.IntersectionObserver;
    delete globalWithIO.IntersectionObserver;

    const cleanup = renderSections(["one"]);
    const onActiveIdChange = vi.fn();

    expect(() =>
      render(<ScrollSpyProbe ids={["one"]} onActiveIdChange={onActiveIdChange} />),
    ).not.toThrow();

    cleanup();
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      originalIO;
  });
});
