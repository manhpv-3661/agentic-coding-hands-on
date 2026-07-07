import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosPersonBlock } from "./kudos-person-block";
import type { KudosPerson } from "@/lib/kudos/kudos-types";

describe("KudosPersonBlock", () => {
  it("renders the name, department, and star count", () => {
    const person: KudosPerson = { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 };
    render(<KudosPersonBlock person={person} />);

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByText(/Phòng Kỹ thuật/)).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it("omits the department/star line for an anonymous sender (F007, FR-18)", () => {
    const person: KudosPerson = { name: "Sunner ẩn danh", department: "", stars: 0 };
    render(<KudosPersonBlock person={person} />);

    expect(screen.getByText("Sunner ẩn danh")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders the danh hiệu badge chip when the person carries one", () => {
    // `KudosPerson` has no `badge` field — `personBadge` (`kudos-data.ts`)
    // reads it defensively, mirroring how mock data attaches one
    // (`personWithBadge`).
    const person = { name: "Trần Thị Bình", department: "Phòng Thiết kế", stars: 18, badge: "Legend Hero" } as KudosPerson;
    render(<KudosPersonBlock person={person} />);

    expect(screen.getByText("Legend Hero")).toBeInTheDocument();
  });

  it("omits the badge chip when the person carries none", () => {
    const person: KudosPerson = { name: "Lê Hoàng Nam", department: "Phòng Kinh doanh", stars: 9 };
    render(<KudosPersonBlock person={person} />);

    expect(screen.queryByText(/Hero/)).not.toBeInTheDocument();
  });

  it("does not render a link or button (no profile navigation)", () => {
    const person: KudosPerson = { name: "Phạm Thị Hương", department: "Phòng Kỹ thuật", stars: 21 };
    render(<KudosPersonBlock person={person} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
