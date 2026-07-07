import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "./language-selector";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("LanguageSelector", () => {
  const refresh = vi.fn();

  beforeEach(() => {
    refresh.mockClear();
    vi.mocked(useRouter).mockReturnValue({
      refresh,
    } as unknown as ReturnType<typeof useRouter>);

    // Clear document.cookie before each test
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
  });

  it("renders seeded from initialLocale='vi'", () => {
    render(<LanguageSelector initialLocale="vi" />);
    expect(screen.getByText("VN")).toBeInTheDocument();
  });

  it("renders seeded from initialLocale='en'", () => {
    render(<LanguageSelector initialLocale="en" />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("displays Vietnamese flag image", () => {
    render(<LanguageSelector initialLocale="vi" />);
    const img = screen.getByAltText("") as HTMLImageElement;
    expect(img.src).toContain("VN.svg");
  });

  it("opens dropdown when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button", { expanded: false });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("displays VN and EN options in dropdown", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(screen.getByText(/Tiếng Việt/)).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it("closes dropdown when option is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const enOption = screen.getByText(/English/);
    await user.click(enOption);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("sets NEXT_LOCALE cookie to 'en' when EN is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    const enOption = screen.getByText(/English/);
    await user.click(enOption);

    expect(document.cookie).toContain("NEXT_LOCALE=en");
  });

  it("sets NEXT_LOCALE cookie to 'vi' when VN is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="en" />);

    // First select EN
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    const enOption = screen.getByText(/English/);
    await user.click(enOption);

    // Then select VN
    await user.click(trigger);
    const viOption = screen.getByText(/Tiếng Việt/);
    await user.click(viOption);

    expect(document.cookie).toContain("NEXT_LOCALE=vi");
  });

  it("calls router.refresh() after selecting a locale", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    const enOption = screen.getByText(/English/);
    await user.click(enOption);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("calls router.refresh() on every locale selection", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(screen.getByText(/English/));

    await user.click(trigger);
    await user.click(screen.getByText(/Tiếng Việt/));

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("closes dropdown when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>Outside button</button>
        <LanguageSelector initialLocale="vi" />
      </div>
    );

    const trigger = screen.getByRole("button", { name: /VN/ });
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const outsideButton = screen.getByRole("button", { name: /Outside/ });
    await user.click(outsideButton);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows chevron icon rotated when dropdown is open", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    const chevron = trigger.querySelector("svg");

    expect(chevron).not.toHaveClass("rotate-180");

    await user.click(trigger);
    expect(chevron).toHaveClass("rotate-180");
  });

  it("marks selected option with aria-selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    const viOption = screen.getByText(/Tiếng Việt/).closest("[role='option']");
    const enOption = screen.getByText(/English/).closest("[role='option']");

    expect(viOption).toHaveAttribute("aria-selected", "true");
    expect(enOption).toHaveAttribute("aria-selected", "false");
  });

  it("updates aria-selected when selection changes", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector initialLocale="vi" />);

    let trigger = screen.getByRole("button");
    await user.click(trigger);

    const enOption = screen.getByText(/English/);
    await user.click(enOption);

    trigger = screen.getByRole("button");
    await user.click(trigger);

    const viOption = screen.getByText(/Tiếng Việt/).closest("[role='option']");
    const enOptionAgain = screen.getByText(/English/).closest("[role='option']");

    expect(viOption).toHaveAttribute("aria-selected", "false");
    expect(enOptionAgain).toHaveAttribute("aria-selected", "true");
  });
});
