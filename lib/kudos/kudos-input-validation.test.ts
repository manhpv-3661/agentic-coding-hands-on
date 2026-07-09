import { describe, expect, it } from "vitest";
import { validateCreateKudosInput } from "./kudos-input-validation";
import {
  KUDOS_CONTENT_MAX_LENGTH,
  KUDOS_HASHTAGS_MAX_COUNT,
} from "./kudos-compose-limits";
import type { CreateKudosInput } from "./kudos-action-types";

const VALID_INPUT: CreateKudosInput = {
  title: "Great work",
  content: "Thanks for the help!",
  hashtags: ["#teamwork"],
  imageUrls: [],
  isAnonymous: false,
  anonymousName: "",
  receiverId: "user-2",
};

describe("validateCreateKudosInput", () => {
  it("returns null for a fully valid input (happy path)", () => {
    expect(validateCreateKudosInput(VALID_INPUT)).toBeNull();
  });

  it("returns null when content is exactly at the max length boundary", () => {
    const input = { ...VALID_INPUT, content: "a".repeat(KUDOS_CONTENT_MAX_LENGTH) };
    expect(validateCreateKudosInput(input)).toBeNull();
  });

  it("rejects content longer than KUDOS_CONTENT_MAX_LENGTH", () => {
    const input = { ...VALID_INPUT, content: "a".repeat(KUDOS_CONTENT_MAX_LENGTH + 1) };
    expect(validateCreateKudosInput(input)).toBe("content_too_long");
  });

  it("rejects blank content", () => {
    expect(validateCreateKudosInput({ ...VALID_INPUT, content: "   " })).toBe("invalid_content");
  });

  it("rejects a blank title", () => {
    expect(validateCreateKudosInput({ ...VALID_INPUT, title: "  " })).toBe("invalid_title");
  });

  it("returns null when hashtags is exactly at the max count boundary", () => {
    const input = {
      ...VALID_INPUT,
      hashtags: Array.from({ length: KUDOS_HASHTAGS_MAX_COUNT }, (_, i) => `#tag${i}`),
    };
    expect(validateCreateKudosInput(input)).toBeNull();
  });

  it("rejects a hashtags array larger than KUDOS_HASHTAGS_MAX_COUNT (bypassing the client cap)", () => {
    const input = {
      ...VALID_INPUT,
      hashtags: Array.from({ length: KUDOS_HASHTAGS_MAX_COUNT + 1 }, (_, i) => `#tag${i}`),
    };
    expect(validateCreateKudosInput(input)).toBe("too_many_hashtags");
  });

  it("rejects a non-array hashtags value", () => {
    const input = { ...VALID_INPUT, hashtags: "not-an-array" as unknown as string[] };
    expect(validateCreateKudosInput(input)).toBe("invalid_hashtags");
  });

  it("rejects a hashtags array containing a non-string element", () => {
    const input = { ...VALID_INPUT, hashtags: [123 as unknown as string] };
    expect(validateCreateKudosInput(input)).toBe("invalid_hashtags");
  });

  it("accepts an empty image list when no image was uploaded", () => {
    expect(validateCreateKudosInput({ ...VALID_INPUT, imageUrls: [] })).toBeNull();
  });

  it("accepts non-empty image URL strings", () => {
    expect(
      validateCreateKudosInput({
        ...VALID_INPUT,
        imageUrls: ["https://cdn.example.com/kudos/image-1.png"],
      }),
    ).toBeNull();
  });

  it("rejects a blank image URL string", () => {
    expect(validateCreateKudosInput({ ...VALID_INPUT, imageUrls: [""] })).toBe("invalid_image_urls");
  });

  it("rejects too many image URLs", () => {
    expect(
      validateCreateKudosInput({
        ...VALID_INPUT,
        imageUrls: Array.from({ length: 6 }, (_, index) => `https://cdn.example.com/${index}.png`),
      }),
    ).toBe("too_many_images");
  });

  it("rejects a blank receiverId", () => {
    expect(validateCreateKudosInput({ ...VALID_INPUT, receiverId: "" })).toBe("invalid_recipient");
  });

  it("rejects a non-boolean isAnonymous flag", () => {
    const input = { ...VALID_INPUT, isAnonymous: "yes" as unknown as boolean };
    expect(validateCreateKudosInput(input)).toBe("invalid_anonymous_flag");
  });

  it("accepts both anonymous and non-anonymous posts", () => {
    const input = { ...VALID_INPUT, isAnonymous: true, anonymousName: "Doraemon" };
    expect(validateCreateKudosInput(input)).toBeNull();
  });

  it("rejects an anonymous post without anonymousName", () => {
    expect(
      validateCreateKudosInput({ ...VALID_INPUT, isAnonymous: true, anonymousName: "" }),
    ).toBe("invalid_anonymous_name");
  });
});
