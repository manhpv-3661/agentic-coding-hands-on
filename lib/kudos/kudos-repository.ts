// server-only: uses `createClient()` from lib/supabase/server.ts, which reads
// request cookies via `next/headers`. Never import this from a Client
// Component (mirrors the convention in lib/supabase/server.ts).
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatSupabaseError } from "@/lib/supabase/format-error";
import type { KudosPerson, KudosPost } from "./kudos-types";
import type { KudosQueryRow } from "./kudos-db-types";
import { CURRENT_USER, KUDOS_POSTS } from "./kudos-data";
import { mapRowToKudosPost } from "./kudos-row-mapper";

/**
 * Data-access layer for the Kudos live board (F006/F007/F008 backend
 * pivot). Every export here returns the SAME view-model shapes
 * (`KudosPost[]`, `KudosPerson`) the page already consumes — from Postgres
 * when Supabase is configured, from the static mock otherwise. Adapt DB
 * rows → `KudosPost` at this boundary only; `kudos-selectors.ts` and
 * `app/components/kudos/*` keep operating on `KudosPost` unchanged.
 *
 * In true mock mode (`!isSupabaseConfigured()`) the old shipped static data
 * is still returned. But once Supabase is configured, query failures must
 * not silently fall back to fake content — that hides real integration
 * breakages (missing tables, broken relations, deleted data) behind a
 * seemingly healthy UI.
 */

/**
 * All Kudos posts, newest first. Hearts = live like count over
 * `kudos_likes`, MINUS the current user's own like row when present.
 *
 * That exclusion matters (phase-05 plan, "Double-count" risk): the client
 * already overlays its own `+1` when a post is in the user's `likedIds` set
 * (`post.hearts + (liked ? 1 : 0)`). If this server count included the
 * user's own like row too, the acting user's like would be counted twice.
 * So the count returned here always reflects OTHER users' likes only; the
 * client is solely responsible for the current user's own delta.
 */
export async function getKudosPosts(): Promise<KudosPost[]> {
  if (!isSupabaseConfigured()) {
    return KUDOS_POSTS;
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const [{ data, error }, { data: likedRows, error: likedError }] = await Promise.all([
    supabase
      .from("kudos")
      .select(
        "*, sender:profiles!kudos_sender_id_fkey(id, full_name, avatar_url, department), receiver:profiles!kudos_receiver_id_fkey(id, full_name, avatar_url, department), kudos_likes(count)",
      )
      .order("created_at", { ascending: false }),
    currentUserId
      ? supabase.from("kudos_likes").select("kudos_id").eq("user_id", currentUserId)
      : Promise.resolve({ data: [] as { kudos_id: string }[], error: null }),
  ]);

  if (error || !data) {
    console.error(
      "[kudos-repository] getKudosPosts failed, returning empty real-mode list:",
      formatSupabaseError(error),
    );
    return [];
  }

  if (likedError) {
    console.error(
      "[kudos-repository] getKudosPosts liked-ids lookup failed, treating as none liked by current user:",
      formatSupabaseError(likedError),
    );
  }

  const likedByCurrentUser = new Set((likedRows ?? []).map((row) => row.kudos_id as string));
  const rows = data as unknown as KudosQueryRow[];

  return rows.map((row) => {
    const rawLikeCount = row.kudos_likes?.[0]?.count ?? 0;
    const likeCount = likedByCurrentUser.has(row.id)
      ? Math.max(0, rawLikeCount - 1)
      : rawLikeCount;
    return mapRowToKudosPost(row, likeCount, currentUserId);
  });
}

/**
 * IDs of the posts `userId` has liked — used to seed the client's
 * session-scoped `likedIds` state so a page reload reflects prior likes.
 * Empty in mock mode or when there is no authenticated user.
 */
export async function getLikedPostIds(userId: string | null): Promise<string[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos_likes")
    .select("kudos_id")
    .eq("user_id", userId);

  if (error || !data) {
    console.error(
      "[kudos-repository] getLikedPostIds failed, falling back to empty list:",
      formatSupabaseError(error),
    );
    return [];
  }

  return data.map((row) => row.kudos_id as string);
}

/**
 * The signed-in user as a `KudosPerson` — replaces the `CURRENT_USER` mock
 * constant as the compose form's `sender`.
 *
 * Mock mode, or no authenticated user, returns `CURRENT_USER` unchanged.
 * In configured mode a missing `profiles` row degrades to the authenticated
 * Supabase user metadata instead of a fake mock identity.
 */
export async function getCurrentKudosPerson(user: User | null): Promise<KudosPerson> {
  if (!isSupabaseConfigured() || !user) {
    return CURRENT_USER;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, department")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    console.error(
      "[kudos-repository] getCurrentKudosPerson failed, falling back to auth user metadata:",
      formatSupabaseError(error),
    );
    return {
      id: user.id,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        "",
      department: "",
      stars: 0,
      avatarUrl:
        (user.user_metadata?.avatar_url as string | undefined) ??
        (user.user_metadata?.picture as string | undefined),
    };
  }

  return {
    id: data.id,
    name: data.full_name ?? "",
    department: data.department ?? "",
    stars: 0,
    avatarUrl: data.avatar_url ?? undefined,
  };
}

/**
 * Recipient options for the compose form. In real mode this is the full
 * `profiles` list except the current user; in mock mode it falls back to
 * distinct people inferred from the shipped static Kudos dataset.
 */
export async function getRecipientOptions(
  userId: string | null,
  fallbackOptions: KudosPerson[],
): Promise<KudosPerson[]> {
  if (!isSupabaseConfigured() || !userId) {
    return fallbackOptions;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, department")
    .neq("id", userId)
    .order("full_name", { ascending: true });

  if (error || !data) {
    console.error(
      "[kudos-repository] getRecipientOptions failed, returning empty real-mode recipients:",
      formatSupabaseError(error),
    );
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    name: (row.full_name as string | null) ?? "",
    department: (row.department as string | null) ?? "",
    stars: 0,
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
  }));
}
