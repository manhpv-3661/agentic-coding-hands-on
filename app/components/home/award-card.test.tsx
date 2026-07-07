import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardCard } from "./award-card";

describe("AwardCard", () => {
  it("renders the description and detailsCta props verbatim (F005)", () => {
    render(
      <AwardCard
        thumbnailSrc="/awards-saa/thumbnails/top-talent.png"
        titleAlt="Top Talent"
        description="Honoring the top individuals who excel across every dimension"
        detailsHref="/awards#top-talent"
        detailsCta="Details"
      />,
    );

    expect(
      screen.getByText("Honoring the top individuals who excel across every dimension"),
    ).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Top Talent" })).toBeInTheDocument();
  });

  it("links the whole card to detailsHref", () => {
    render(
      <AwardCard
        thumbnailSrc="/awards-saa/thumbnails/top-talent.png"
        titleAlt="Top Talent"
        description="Vinh danh top cá nhân xuất sắc trên mọi phương diện"
        detailsHref="/awards#top-talent"
        detailsCta="Chi tiết"
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/awards#top-talent");
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
  });
});
