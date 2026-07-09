import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("returns an empty string when called with no args", () => {
    expect(cn()).toBe("");
  });

  it("returns the value unchanged for a single arg", () => {
    expect(cn("a")).toBe("a");
  });

  it("filters out false, null, and undefined", () => {
    expect(cn("a", false, "b", null, undefined)).toBe("a b");
  });

  it("joins multiple truthy args with a single space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("supports the cond && x idiom", () => {
    const selected = true;
    const notSelected = false;
    expect(cn("base", selected && "selected")).toBe("base selected");
    expect(cn("base", notSelected && "selected")).toBe("base");
  });

  it("never produces a leading, trailing, or double space", () => {
    expect(cn(false, "a", undefined, "b", null)).toBe("a b");
    expect(cn(undefined, null, false)).toBe("");
  });
});
