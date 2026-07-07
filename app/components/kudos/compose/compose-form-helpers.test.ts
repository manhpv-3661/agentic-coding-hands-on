import { describe, expect, it } from "vitest";
import {
  buildKudosPost,
  EMPTY_COMPOSE_FORM_STATE,
  validateComposeForm,
  type ComposeFormState,
} from "./compose-form-helpers";
import type { KudosPerson } from "@/lib/kudos/kudos-types";

const messages = {
  recipient: "Vui lòng chọn người nhận.",
  title: "Vui lòng nhập danh hiệu.",
  content: "Vui lòng nhập nội dung.",
  hashtags: "Thêm ít nhất 1 hashtag.",
  nickname: "Vui lòng nhập nickname.",
};

const recipient: KudosPerson = { name: "R", department: "Dept R", stars: 1 };
const currentUser: KudosPerson = { name: "Current User", department: "Dept X", stars: 8 };

function makeValidState(overrides: Partial<ComposeFormState> = {}): ComposeFormState {
  return {
    ...EMPTY_COMPOSE_FORM_STATE,
    recipient,
    title: "Danh hiệu",
    content: "Nội dung",
    hashtags: ["#a"],
    ...overrides,
  };
}

describe("validateComposeForm", () => {
  it("returns no errors for a fully valid, non-anonymous state", () => {
    expect(validateComposeForm(makeValidState(), messages)).toEqual({});
  });

  it("flags recipient, title, content, and hashtags when all are empty", () => {
    const errors = validateComposeForm(EMPTY_COMPOSE_FORM_STATE, messages);
    expect(errors).toEqual({
      recipient: messages.recipient,
      title: messages.title,
      content: messages.content,
      hashtags: messages.hashtags,
    });
  });

  it("does not require a nickname when anonymous is false", () => {
    const errors = validateComposeForm(makeValidState({ anonymous: false, nickname: "" }), messages);
    expect(errors.nickname).toBeUndefined();
  });

  it("requires a nickname when anonymous is true and nickname is blank", () => {
    const errors = validateComposeForm(makeValidState({ anonymous: true, nickname: "  " }), messages);
    expect(errors.nickname).toBe(messages.nickname);
  });

  it("accepts a trimmed non-empty nickname when anonymous", () => {
    const errors = validateComposeForm(makeValidState({ anonymous: true, nickname: "Doraemon" }), messages);
    expect(errors.nickname).toBeUndefined();
  });
});

describe("buildKudosPost", () => {
  const now = new Date(2026, 0, 5, 9, 3);

  it("uses currentUser as sender and formats the timestamp when not anonymous", () => {
    const post = buildKudosPost(makeValidState(), currentUser, now);

    expect(post.sender).toEqual(currentUser);
    expect(post.recipient).toEqual(recipient);
    expect(post.timestamp).toBe("09:03 - 01/05/2026");
    expect(post.hearts).toBe(0);
    expect(post.imageCount).toBe(0);
    expect(post.title).toBe("Danh hiệu");
    expect(post.sentByCurrentUser).toBe(true);
    expect(post.anonymous).toBe(false);
  });

  it("substitutes the nickname as sender (blank department/stars) when anonymous", () => {
    const post = buildKudosPost(
      makeValidState({ anonymous: true, nickname: "Doraemon" }),
      currentUser,
      now,
    );

    expect(post.sender).toEqual({ name: "Doraemon", department: "", stars: 0 });
  });

  it("still marks an anonymous post as sentByCurrentUser (self-like loophole fix)", () => {
    const post = buildKudosPost(
      makeValidState({ anonymous: true, nickname: "Doraemon" }),
      currentUser,
      now,
    );

    expect(post.sentByCurrentUser).toBe(true);
    expect(post.anonymous).toBe(true);
  });

  it("produces unique ids for two posts built back-to-back with the same timestamp", () => {
    const first = buildKudosPost(makeValidState(), currentUser, now);
    const second = buildKudosPost(makeValidState(), currentUser, now);

    expect(first.id).not.toBe(second.id);
  });

  it("sets imageCount to the number of selected images", () => {
    const images = [new File([""], "a.png"), new File([""], "b.png")];
    const post = buildKudosPost(makeValidState({ images }), currentUser, now);
    expect(post.imageCount).toBe(2);
  });

  it("trims title and content", () => {
    const post = buildKudosPost(
      makeValidState({ title: "  Danh hiệu  ", content: "  Nội dung  " }),
      currentUser,
      now,
    );
    expect(post.title).toBe("Danh hiệu");
    expect(post.content).toBe("Nội dung");
  });
});
