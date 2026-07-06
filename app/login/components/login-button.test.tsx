import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginButton } from "./login-button";

describe("LoginButton", () => {
  it("renders default state with label and Google icon", () => {
    const onLogin = vi.fn();
    render(
      <LoginButton onLogin={onLogin} loading={false} disabled={false} />
    );

    expect(screen.getByRole("button", { name: /LOGIN With Google/i })).toBeInTheDocument();
    expect(screen.getByAltText("")).toBeInTheDocument(); // Google icon has empty alt
  });

  it("calls onLogin when clicked", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(
      <LoginButton onLogin={onLogin} loading={false} disabled={false} />
    );

    const button = screen.getByRole("button", { name: /LOGIN With Google/i });
    await user.click(button);

    expect(onLogin).toHaveBeenCalledOnce();
  });

  it("shows loading spinner and disabled state when loading=true", () => {
    const onLogin = vi.fn();
    render(
      <LoginButton onLogin={onLogin} loading={true} disabled={false} />
    );

    expect(screen.getByText("Đang đăng nhập...")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("disables button when disabled=true", () => {
    const onLogin = vi.fn();
    render(
      <LoginButton onLogin={onLogin} loading={false} disabled={true} />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when both loading and disabled are true", () => {
    const onLogin = vi.fn();
    render(
      <LoginButton onLogin={onLogin} loading={true} disabled={true} />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders error message when error prop is set", () => {
    const onLogin = vi.fn();
    const errorMsg = "Đăng nhập không thành công. Vui lòng thử lại.";
    render(
      <LoginButton onLogin={onLogin} loading={false} error={errorMsg} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(errorMsg);
  });

  it("does not render error when error is null", () => {
    const onLogin = vi.fn();
    render(
      <LoginButton onLogin={onLogin} loading={false} error={null} />
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("has hover shadow class present in className", () => {
    const onLogin = vi.fn();
    const { container } = render(
      <LoginButton onLogin={onLogin} loading={false} disabled={false} />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("hover:shadow");
  });

  it("spinner is visible and animated when loading", () => {
    render(
      <LoginButton onLogin={onLogin} loading={true} disabled={false} />
    );

    const spinner = screen.getByRole("button").querySelector("[aria-hidden='true']");
    expect(spinner).toHaveClass("animate-spin");
    expect(spinner).toHaveClass("rounded-full");
  });

  function onLogin() {}
});
