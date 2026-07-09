import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createKudosAction, toggleLikeAction } from "./actions";
import type { CreateKudosInput } from "@/lib/kudos/kudos-action-types";

/**
 * Minimal fluent stand-in for a `@supabase/supabase-js` query builder.
 * `select`/`eq`/`insert`/`delete` return the same builder (chainable);
 * `single`/`maybeSingle` resolve to `result`; the builder itself is also
 * thenable so `await supabase.from(...).insert(...)` (no `.select()`)
 * resolves to `result` too — matching how the actions actually await it.
 */
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  return builder;
}

function makeSupabaseClient(options: {
  user: { id: string } | null;
  from?: (table: string) => Record<string, unknown>;
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: options.user } }),
    },
    from: vi.fn(options.from ?? (() => makeQueryBuilder({ data: null, error: null }))),
  };
}

const CREATE_INPUT: CreateKudosInput = {
  title: "Great work",
  content: "Thanks for the help!",
  hashtags: ["#teamwork"],
  imageUrls: [],
  isAnonymous: false,
  anonymousName: "",
  receiverId: "user-2",
};

describe("createKudosAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns skipped:true without touching Supabase when not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await createKudosAction(CREATE_INPUT);

    expect(result).toEqual({ ok: true, skipped: true });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects when there is no authenticated user", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: null }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const result = await createKudosAction(CREATE_INPUT);

    expect(result).toEqual({ ok: false, error: "unauthenticated" });
  });

  it("inserts with sender_id from auth.uid() (never client input) and revalidates", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const insertBuilder = makeQueryBuilder({ data: { id: "post-1" }, error: null });
    const client = makeSupabaseClient({
      user: { id: "user-1" },
      from: () => insertBuilder,
    });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await createKudosAction(CREATE_INPUT);

    expect(result).toEqual({ ok: true, skipped: false, postId: "post-1" });
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ sender_id: "user-1", content: CREATE_INPUT.content }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/kudos");
  });

  it("passes uploaded image URLs through to the insert payload", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const insertBuilder = makeQueryBuilder({ data: { id: "post-2" }, error: null });
    const client = makeSupabaseClient({
      user: { id: "user-1" },
      from: () => insertBuilder,
    });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    await createKudosAction({
      ...CREATE_INPUT,
      imageUrls: ["https://cdn.example.com/kudos/image-1.png"],
    });

    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        image_urls: ["https://cdn.example.com/kudos/image-1.png"],
      }),
    );
  });

  // Review finding H1: server-side bound/type validation, re-checked here
  // as an integration test against the real action (the exhaustive
  // per-rule matrix lives in `lib/kudos/kudos-input-validation.test.ts`).
  it("rejects a blank receiverId before ever touching Supabase", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const result = await createKudosAction({ ...CREATE_INPUT, receiverId: "   " });

    expect(result).toEqual({ ok: false, error: "invalid_recipient" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects a blank title before ever touching Supabase", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const result = await createKudosAction({ ...CREATE_INPUT, title: "   " });

    expect(result).toEqual({ ok: false, error: "invalid_title" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects content over the shared KUDOS_CONTENT_MAX_LENGTH bound even though Supabase isn't configured (validation runs before the mock-mode skip)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await createKudosAction({ ...CREATE_INPUT, content: "a".repeat(1001) });

    expect(result).toEqual({ ok: false, error: "content_too_long" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects a hashtags array bypassing the client's max-5 cap", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const result = await createKudosAction({
      ...CREATE_INPUT,
      hashtags: ["#a", "#b", "#c", "#d", "#e", "#f"],
    });

    expect(result).toEqual({ ok: false, error: "too_many_hashtags" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects an empty imageUrls entry bypassing the client UI entirely", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const result = await createKudosAction({ ...CREATE_INPUT, imageUrls: [""] });

    expect(result).toEqual({ ok: false, error: "invalid_image_urls" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a typed error when the insert fails", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const insertBuilder = makeQueryBuilder({
      data: null,
      error: { message: "insert failed" },
    });
    const client = makeSupabaseClient({
      user: { id: "user-1" },
      from: () => insertBuilder,
    });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await createKudosAction(CREATE_INPUT);

    expect(result).toEqual({ ok: false, error: "insert_failed" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("never throws — returns a typed error when Supabase itself throws", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockRejectedValue(new Error("network down"));

    const result = await createKudosAction(CREATE_INPUT);

    expect(result).toEqual({ ok: false, error: "unexpected_error" });
  });
});

describe("toggleLikeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns skipped:true without touching Supabase when not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: true, skipped: true });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects when there is no authenticated user", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: null }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "unauthenticated" });
  });

  it("returns post_not_found when the post lookup fails", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: null, error: { message: "no rows" } });
    const client = makeSupabaseClient({
      user: { id: "user-1" },
      from: vi.fn()
        .mockReturnValueOnce(profileBuilder)
        .mockReturnValueOnce(postBuilder),
    });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "post_not_found" });
  });

  it("blocks a self-like server-side even if the client bypassed the UI", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "user-1" }, error: null });
    const client = makeSupabaseClient({
      user: { id: "user-1" },
      from: vi.fn()
        .mockReturnValueOnce(profileBuilder)
        .mockReturnValueOnce(postBuilder),
    });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "self_like_forbidden" });
  });

  it("likes (inserts) when no existing like row is found", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({ data: null, error: null });
    const likeInsertBuilder = makeQueryBuilder({ data: null, error: null });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder)
      .mockReturnValueOnce(likeInsertBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: true, skipped: false, liked: true });
    expect(likeInsertBuilder.insert).toHaveBeenCalledWith({
      kudos_id: "post-1",
      user_id: "user-1",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/kudos");
  });

  it("unlikes (deletes) when an existing like row is found", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({ data: { id: "like-1" }, error: null });
    const likeDeleteBuilder = makeQueryBuilder({ data: null, error: null });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder)
      .mockReturnValueOnce(likeDeleteBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: true, skipped: false, liked: false });
    expect(likeDeleteBuilder.delete).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/kudos");
  });

  it("treats a concurrent 23505 unique-violation on insert as an idempotent like success", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({ data: null, error: null });
    const likeInsertBuilder = makeQueryBuilder({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder)
      .mockReturnValueOnce(likeInsertBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: true, skipped: false, liked: true });
  });

  it("returns a typed error on a non-23505 insert failure", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({ data: null, error: null });
    const likeInsertBuilder = makeQueryBuilder({
      data: null,
      error: { code: "23503", message: "fk violation" },
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder)
      .mockReturnValueOnce(likeInsertBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "like_failed" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a typed error when the unlike delete fails", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({ data: { id: "like-1" }, error: null });
    const likeDeleteBuilder = makeQueryBuilder({
      data: null,
      error: { message: "delete failed" },
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder)
      .mockReturnValueOnce(likeDeleteBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "unlike_failed" });
  });

  it("returns a typed error when the like lookup itself fails", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    const postBuilder = makeQueryBuilder({ data: { sender_id: "other-user" }, error: null });
    const likeLookupBuilder = makeQueryBuilder({
      data: null,
      error: { message: "lookup failed" },
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(postBuilder)
      .mockReturnValueOnce(likeLookupBuilder);
    const client = makeSupabaseClient({ user: { id: "user-1" }, from: fromMock });
    vi.mocked(createClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "like_lookup_failed" });
  });

  it("never throws — returns a typed error when Supabase itself throws", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(createClient).mockRejectedValue(new Error("network down"));

    const result = await toggleLikeAction("post-1");

    expect(result).toEqual({ ok: false, error: "unexpected_error" });
  });
});
