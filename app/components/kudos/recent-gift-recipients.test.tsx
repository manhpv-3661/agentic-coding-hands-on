import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentGiftRecipients } from "./recent-gift-recipients";
import type { GiftRecipient } from "@/lib/kudos/kudos-types";

describe("RecentGiftRecipients", () => {
  it("renders the heading and 10 rows", () => {
    const recipients: GiftRecipient[] = Array.from({ length: 10 }, () => ({
      name: "Huỳnh Dương Xuân",
      gift: "Nhận được 1 áo phông SAA",
    }));

    render(
      <RecentGiftRecipients
        heading="10 SUNNER NHẬN QUÀ MỚI NHẤT"
        recipients={recipients}
        emptyLabel="Chưa có dữ liệu"
      />,
    );

    expect(screen.getByText("10 SUNNER NHẬN QUÀ MỚI NHẤT")).toBeInTheDocument();
    expect(screen.getAllByText("Huỳnh Dương Xuân")).toHaveLength(10);
  });

  it("renders the empty-state message when there are no recipients (FR-21)", () => {
    render(
      <RecentGiftRecipients
        heading="10 SUNNER NHẬN QUÀ MỚI NHẤT"
        recipients={[]}
        emptyLabel="Chưa có dữ liệu"
      />,
    );

    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });
});
