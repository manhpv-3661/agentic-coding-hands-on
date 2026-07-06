import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosSectionHeading } from "./kudos-section-heading";

describe("KudosSectionHeading", () => {
  it("renders the subtitle and title", () => {
    render(<KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="HIGHLIGHT KUDOS" />);

    expect(screen.getByText("Sun* Annual Awards 2025")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "HIGHLIGHT KUDOS" })).toBeInTheDocument();
  });
});
