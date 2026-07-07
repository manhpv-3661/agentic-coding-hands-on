import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpotlightNameCloud } from "./spotlight-name-cloud";
import { SPOTLIGHT_NAMES } from "@/lib/kudos/kudos-spotlight-data";

describe("SpotlightNameCloud", () => {
  it("renders every name", () => {
    render(<SpotlightNameCloud names={["An", "Bình", "Nam"]} query="" panZoom={false} />);

    expect(screen.getByText("An")).toBeInTheDocument();
    expect(screen.getByText("Bình")).toBeInTheDocument();
    expect(screen.getByText("Nam")).toBeInTheDocument();
  });

  it("marks names matching the query (case-insensitive substring) and leaves others unmatched", () => {
    render(<SpotlightNameCloud names={["Nguyễn Văn An", "Trần Thị Bình"]} query="an" panZoom={false} />);

    expect(screen.getByText("Nguyễn Văn An")).toHaveAttribute("data-matched", "true");
    expect(screen.getByText("Trần Thị Bình")).toHaveAttribute("data-matched", "false");
  });

  it("marks every name unmatched when the query is empty", () => {
    render(<SpotlightNameCloud names={["An", "Bình"]} query="" panZoom={false} />);

    expect(screen.getByText("An")).toHaveAttribute("data-matched", "false");
    expect(screen.getByText("Bình")).toHaveAttribute("data-matched", "false");
  });

  it("gives every name a distinct position, even past 12 names (regression: a fixed 12-slot table made index i and i+12 land on the identical top/left)", () => {
    const names = Array.from({ length: 24 }, (_, i) => `Name ${i}`);
    render(<SpotlightNameCloud names={names} query="" panZoom={false} />);

    const positions = names.map((name) => {
      const el = screen.getByText(name);
      return `${el.style.top}|${el.style.left}`;
    });
    expect(new Set(positions).size).toBe(names.length);
  });

  it("gives every name a distinct position for the real production dataset (regression: the collision retry loop froze at a clamped corner once radius growth saturated, pinning multiple names to the identical top/left)", () => {
    render(<SpotlightNameCloud names={SPOTLIGHT_NAMES} query="" panZoom={false} />);

    const positions = SPOTLIGHT_NAMES.map((name) => {
      const el = screen.getByText(name);
      return `${el.style.top}|${el.style.left}`;
    });
    expect(new Set(positions).size).toBe(SPOTLIGHT_NAMES.length);
  });
});
