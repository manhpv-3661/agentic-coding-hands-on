import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpotlightNameCloud } from "./spotlight-name-cloud";
import { SPOTLIGHT_NAMES } from "@/lib/kudos/kudos-spotlight-data";
import { SPOTLIGHT_NAME_SLOTS } from "@/lib/kudos/spotlight-name-cloud-slots";

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

  it("pins the production dataset to the fixed spotlight slots", () => {
    const { container } = render(<SpotlightNameCloud names={SPOTLIGHT_NAMES} query="" panZoom={false} />);

    SPOTLIGHT_NAMES.forEach((name, index) => {
      const el = container.querySelector<HTMLElement>(`[data-spotlight-index="${index}"]`);
      const slot = SPOTLIGHT_NAME_SLOTS[index];
      expect(el).not.toBeNull();
      expect(el).toHaveTextContent(name);
      expect(el).toHaveClass(slot.size);
      expect(Number.parseFloat(el!.style.top)).toBeCloseTo(Number.parseFloat(slot.top), 5);
      expect(Number.parseFloat(el!.style.left)).toBeCloseTo(Number.parseFloat(slot.left), 5);
    });
  });

  it("renders the accent color on the one fixed accent slot", () => {
    const { container } = render(<SpotlightNameCloud names={SPOTLIGHT_NAMES} query="" panZoom={false} />);
    const accentIndex = SPOTLIGHT_NAME_SLOTS.findIndex((slot) => slot.tone === "accent");
    const accentNode = container.querySelector<HTMLElement>(`[data-spotlight-index="${accentIndex}"]`);
    const neighborNode = container.querySelector<HTMLElement>(`[data-spotlight-index="${accentIndex - 1}"]`);

    expect(accentNode).not.toBeNull();
    expect(neighborNode).not.toBeNull();
    expect(accentNode).toHaveClass("text-[#F17676]");
    expect(neighborNode).toHaveClass("text-white");
  });
});
