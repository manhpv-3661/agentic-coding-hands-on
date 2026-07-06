import { describe, it, expect } from "vitest";
import { sanitizeInternalPath } from "@/lib/safe-redirect";

/**
 * Tests for open-redirect guard (SC-004).
 * Mirrors the inline check in `app/auth/callback/route.ts`.
 */
describe("sanitizeInternalPath", () => {
  it("accepts valid relative paths starting with /", () => {
    expect(sanitizeInternalPath("/awards")).toBe("/awards");
    expect(sanitizeInternalPath("/kudos")).toBe("/kudos");
    expect(sanitizeInternalPath("/todo")).toBe("/todo");
  });

  it("accepts relative paths with query params", () => {
    expect(sanitizeInternalPath("/awards?foo=bar")).toBe("/awards?foo=bar");
    expect(sanitizeInternalPath("/kudos?page=1&sort=asc")).toBe(
      "/kudos?page=1&sort=asc"
    );
  });

  it("accepts relative paths with fragments", () => {
    expect(sanitizeInternalPath("/awards#section")).toBe("/awards#section");
  });

  it("rejects protocol-based absolute URLs (open-redirect)", () => {
    expect(sanitizeInternalPath("https://evil.com")).toBe("/");
    expect(sanitizeInternalPath("http://evil.com")).toBe("/");
    expect(sanitizeInternalPath("//evil.com")).toBe("/");
    expect(sanitizeInternalPath("///evil.com")).toBe("/");
  });

  it("rejects double-slash protocol-relative URLs", () => {
    expect(sanitizeInternalPath("//evil.com/path")).toBe("/");
  });

  it("rejects null and undefined", () => {
    expect(sanitizeInternalPath(null)).toBe("/");
    expect(sanitizeInternalPath(undefined)).toBe("/");
  });

  it("rejects empty string", () => {
    expect(sanitizeInternalPath("")).toBe("/");
  });

  it("rejects paths without leading slash", () => {
    expect(sanitizeInternalPath("awards")).toBe("/");
    expect(sanitizeInternalPath("relative/path")).toBe("/");
  });

  it("accepts root path", () => {
    expect(sanitizeInternalPath("/")).toBe("/");
  });

  it("accepts root with query params", () => {
    expect(sanitizeInternalPath("/?next=true")).toBe("/?next=true");
  });

  it("rejects javascript protocol (XSS)", () => {
    expect(sanitizeInternalPath("javascript:alert(1)")).toBe("/");
  });

  it("rejects data URIs", () => {
    expect(sanitizeInternalPath("data:text/html,<script>alert(1)</script>")).toBe(
      "/"
    );
  });
});
