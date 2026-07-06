import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosBanner } from "./kudos-banner";

describe("KudosBanner", () => {
  it("renders the banner title, the KUDOS wordmark, and the composer placeholder", () => {
    render(
      <KudosBanner
        labels={{ title: "Hệ thống ghi nhận và cảm ơn" }}
        composer={{ placeholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" }}
      />,
    );

    expect(screen.getByText("Hệ thống ghi nhận và cảm ơn")).toBeInTheDocument();
    expect(screen.getByText("KUDOS")).toBeInTheDocument();
    expect(
      screen.getByText("Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"),
    ).toBeInTheDocument();
  });
});
