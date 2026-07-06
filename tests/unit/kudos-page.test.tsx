import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/require-user";
import KudosPage from "@/app/kudos/page";

describe("KudosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls requireUser to guard the route", async () => {
    vi.mocked(requireUser).mockResolvedValue(null);

    render(await KudosPage());

    expect(requireUser).toHaveBeenCalledTimes(1);
  });

  it("renders the Sun* Kudos stub heading", async () => {
    vi.mocked(requireUser).mockResolvedValue(null);

    render(await KudosPage());

    expect(
      screen.getByRole("heading", { name: "Sun* Kudos" }),
    ).toBeInTheDocument();
  });
});
