import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpotlightNameCloud } from "./spotlight-name-cloud";

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
});
