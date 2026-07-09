import type { KudosPerson, KudosPost } from "./kudos-types";
import type { KudosRowWithRelations } from "./kudos-db-types";
import { formatKudosTimestamp } from "./format-kudos-timestamp";

/**
 * Pure DB row → `KudosPost` adapter (no I/O, no Supabase client) — the
 * single place a `kudos` row becomes the view-model type
 * `kudos-selectors.ts` and every `app/components/kudos/*` component already
 * consume unchanged (see phase-02 plan's mapping table).
 *
 * `likeCount` is passed in rather than read off `row` so this stays
 * testable without constructing a fake `kudos_likes(count)` embed shape —
 * `kudos-repository.ts` extracts it from the query row before calling this.
 */
export function mapRowToKudosPost(
  row: KudosRowWithRelations,
  likeCount: number,
  currentUserId: string | null,
): KudosPost {
  const sender: KudosPerson = row.is_anonymous
    ? {
        id: row.sender_id,
        name: row.anonymous_name?.trim() || "Một đồng nghiệp ẩn danh",
        department: "",
        stars: 0,
      }
    : {
        id: row.sender?.id,
        name: row.sender?.full_name ?? "",
        department: row.sender?.department ?? "",
        stars: 0,
        avatarUrl: row.sender?.avatar_url ?? undefined,
      };

  return {
    id: row.id,
    sender,
    recipient: {
      id: row.receiver?.id,
      name: row.receiver?.full_name ?? "",
      department: row.receiver?.department ?? "",
      stars: 0,
      avatarUrl: row.receiver?.avatar_url ?? undefined,
    },
    timestamp: formatKudosTimestamp(new Date(row.created_at)),
    title: row.title ?? undefined,
    content: row.content,
    hashtags: row.hashtags,
    imageCount: row.image_urls.length,
    imageUrls: row.image_urls,
    hearts: likeCount,
    sentByCurrentUser: currentUserId !== null && row.sender_id === currentUserId,
    anonymous: row.is_anonymous,
  };
}
