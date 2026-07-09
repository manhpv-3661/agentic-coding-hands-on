import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getKudosPosts, getLikedPostIds } from "./kudos-repository";
import { KUDOS_POSTS } from "./kudos-data";
import type { KudosQueryRow } from "./kudos-db-types";

/**
 * Minimal fluent stand-in for a `@supabase/supabase-js` query builder —
 * mirrors `app/kudos/actions.test.ts`'s `makeQueryBuilder` so both Kudos
 * data-layer test suites share the same mocking shape (DRY).
 */
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function makeSupabaseClient(options: {
  user: { id: string } | null;
  from: (table: string) => Record<string, unknown>;
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: options.user } }),
    },
    from: vi.fn(options.from),
  };
}

function makePostRow(overrides: Partial<KudosQueryRow> = {}): KudosQueryRow {
  return {
    id: "post-1",
    sender_id: "user-sender",
    receiver_id: "user-receiver",
    title: "Great work",
    content: "Cảm ơn bạn đã hỗ trợ team.",
    hashtags: ["#teamwork"],
    image_urls: [],
    is_anonymous: false,
    anonymous_name: null,
    created_at: "2026-01-01T09:30:00.000Z",
    sender: {
      id: "user-sender",
      full_name: "Nguyễn Văn An",
      avatar_url: null,
      department: "Phòng Kỹ thuật",
    },
    receiver: {
      id: "user-receiver",
      full_name: "Trần Thị Bình",
      avatar_url: null,
      department: "Phòng Thiết kế",
    },
    kudos_likes: [{ count: 3 }],
    ...overrides,
  };
}

describe("getKudosPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the mock KUDOS_POSTS unchanged when Supabase isn't configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await getKudosPosts();

    expect(result).toBe(KUDOS_POSTS);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("excludes the current user's own like row from the hearts count", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const postsBuilder = makeQueryBuilder({ data: [makePostRow()], error: null });
    const likedBuilder = makeQueryBuilder({ data: [{ kudos_id: "post-1" }], error: null });
    const fromMock = vi.fn((table: string) =>
      table === "kudos" ? postsBuilder : likedBuilder,
    );
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: { id: "user-1" }, from: fromMock }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const [post] = await getKudosPosts();

    expect(post.hearts).toBe(2);
  });

  it("keeps the full like count when the current user has NOT liked the post", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const postsBuilder = makeQueryBuilder({ data: [makePostRow()], error: null });
    const likedBuilder = makeQueryBuilder({ data: [], error: null });
    const fromMock = vi.fn((table: string) =>
      table === "kudos" ? postsBuilder : likedBuilder,
    );
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: { id: "user-1" }, from: fromMock }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const [post] = await getKudosPosts();

    expect(post.hearts).toBe(3);
  });

  it("keeps the full like count for an unauthenticated request (no user to exclude)", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const postsBuilder = makeQueryBuilder({ data: [makePostRow()], error: null });
    const fromMock = vi.fn(() => postsBuilder);
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: null, from: fromMock }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const [post] = await getKudosPosts();

    expect(post.hearts).toBe(3);
  });

  it("returns an empty list when the real-mode posts query errors", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const postsBuilder = makeQueryBuilder({ data: null, error: { message: "query failed" } });
    const fromMock = vi.fn(() => postsBuilder);
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: null, from: fromMock }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const result = await getKudosPosts();

    expect(result).toEqual([]);
  });
});

describe("getLikedPostIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty list when Supabase isn't configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await getLikedPostIds("user-1");

    expect(result).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns an empty list when there is no user id", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const result = await getLikedPostIds(null);

    expect(result).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns the post ids the user has liked", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const builder = makeQueryBuilder({
      data: [{ kudos_id: "post-1" }, { kudos_id: "post-2" }],
      error: null,
    });
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ user: { id: "user-1" }, from: () => builder }) as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    const result = await getLikedPostIds("user-1");

    expect(result).toEqual(["post-1", "post-2"]);
  });
});
