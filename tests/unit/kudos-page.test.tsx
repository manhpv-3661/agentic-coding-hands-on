import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Montserrat: vi.fn(() => ({
    variable: "--font-montserrat",
    className: "font-montserrat",
  })),
  Montserrat_Alternates: vi.fn(() => ({
    variable: "--font-montserrat-alternates",
    className: "font-montserrat-alternates",
  })),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
    }),
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/kudos"),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

import { requireUser } from "@/lib/auth/require-user";
import KudosPage from "@/app/kudos/page";

describe("KudosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls requireUser to guard the route (FR-1/FR-2)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await KudosPage());

    expect(requireUser).toHaveBeenCalledTimes(1);
  });

  it("renders the banner title and the KUDOS wordmark (FR-3)", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await KudosPage());

    expect(screen.getByText("Hệ thống ghi nhận và cảm ơn")).toBeInTheDocument();
    expect(screen.getByText("KUDOS")).toBeInTheDocument();
  });

  it("renders the Highlight Kudos, Spotlight Board, and All Kudos sections", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await KudosPage());

    expect(screen.getByRole("heading", { name: "HIGHLIGHT KUDOS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SPOTLIGHT BOARD" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ALL KUDOS" })).toBeInTheDocument();
  });

  it("renders the stats sidebar and the recent gift recipients heading", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    render(await KudosPage());

    expect(screen.getByText("10 SUNNER NHẬN QUÀ MỚI NHẤT")).toBeInTheDocument();
  });

  it("renders the header and footer around the board", async () => {
    vi.mocked(requireUser).mockResolvedValue(null as never);

    const { container } = render(await KudosPage());

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
  });
});
