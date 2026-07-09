"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { validateCreateKudosInput } from "@/lib/kudos/kudos-input-validation";
import {
  getSecretBoxRewardForOpenIndex,
  getUnlockedSecretBoxCount,
} from "@/lib/kudos/kudos-secret-box-rewards";
import type { User } from "@supabase/supabase-js";
import type {
  CreateKudosInput,
  CreateKudosResult,
  OpenSecretBoxResult,
  ToggleLikeResult,
} from "@/lib/kudos/kudos-action-types";

function extractHashtagsFromContent(content: string): string[] {
  const matches = content.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  return matches.map((tag) => tag.trim());
}

function buildStoredHashtags(input: CreateKudosInput): string[] {
  return Array.from(
    new Set(
      [...input.hashtags, ...extractHashtagsFromContent(input.content)]
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  );
}

async function ensureCurrentProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
) {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "";
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
  });

  if (error) {
    console.error("[kudos actions] ensureCurrentProfile failed:", error);
  }
}

/**
 * Server Actions for the Kudos live board's two mutations
 * (F006/F007/F008 backend pivot, phase 03). Both re-check `auth.uid()`
 * inside the action itself — Server Actions are public POST endpoints, so
 * RLS alone is not trusted as the only gate (defense-in-depth).
 *
 * Both no-op gracefully (`{ ok: true, skipped: true }`, no DB touched) when
 * `!isSupabaseConfigured()` so the mock/authless board (and its e2e tests)
 * are unaffected — the client's optimistic state stands alone in that mode.
 */

/**
 * Inserts a new Kudos post authored by the signed-in user. `sender_id` is
 * always taken from `auth.uid()`, never from `input` — prevents a client
 * from spoofing another user's identity even if RLS were misconfigured.
 */
export async function createKudosAction(
  input: CreateKudosInput,
): Promise<CreateKudosResult> {
  // Server Actions are public POST endpoints — re-validate the SAME bounds
  // the compose UI already enforces before anything touches Supabase.
  const validationError = validateCreateKudosInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "unauthenticated" };
    }

    await ensureCurrentProfile(supabase, user);

    const normalizedTitle = input.title.trim();
    const normalizedContent = input.content.trim();
    const normalizedAnonymousName = input.anonymousName.trim();
    const storedHashtags = buildStoredHashtags(input);

    const { data, error } = await supabase
      .from("kudos")
      .insert({
        sender_id: user.id,
        title: normalizedTitle,
        content: normalizedContent,
        image_urls: input.imageUrls,
        receiver_id: input.receiverId,
        is_anonymous: input.isAnonymous,
        anonymous_name: input.isAnonymous ? normalizedAnonymousName : null,
        hashtags: storedHashtags,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[kudos actions] createKudosAction insert failed:", error);
      return { ok: false, error: "insert_failed" };
    }

    revalidatePath("/kudos");
    return { ok: true, skipped: false, postId: data.id as string };
  } catch (err) {
    console.error("[kudos actions] createKudosAction unexpected error:", err);
    return { ok: false, error: "unexpected_error" };
  }
}

/**
 * Toggles the signed-in user's like on `postId`: check-then-act (select
 * existing row → delete if present, insert if absent), with the
 * `unique(user_id, kudos_id)` constraint as an idempotency backstop for a
 * concurrent double-click race (caught as a no-op success, not an error).
 *
 * Self-like is rejected server-side even though the client already hides
 * the like button via `canLikeKudos` — defense-in-depth against a direct
 * action call bypassing the UI.
 */
export async function toggleLikeAction(
  postId: string,
): Promise<ToggleLikeResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "unauthenticated" };
    }

    await ensureCurrentProfile(supabase, user);

    const { data: post, error: postError } = await supabase
      .from("kudos")
      .select("sender_id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error(
        "[kudos actions] toggleLikeAction post lookup failed:",
        postError,
      );
      return { ok: false, error: "post_not_found" };
    }

    if (post.sender_id === user.id) {
      return { ok: false, error: "self_like_forbidden" };
    }

    const { data: existingLike, error: likeLookupError } = await supabase
      .from("kudos_likes")
      .select("id")
      .eq("kudos_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (likeLookupError) {
      console.error(
        "[kudos actions] toggleLikeAction like lookup failed:",
        likeLookupError,
      );
      return { ok: false, error: "like_lookup_failed" };
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("kudos_likes")
        .delete()
        .eq("kudos_id", postId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error(
          "[kudos actions] toggleLikeAction unlike failed:",
          deleteError,
        );
        return { ok: false, error: "unlike_failed" };
      }

      revalidatePath("/kudos");
      return { ok: true, skipped: false, liked: false };
    }

    const { error: insertError } = await supabase
      .from("kudos_likes")
      .insert({ kudos_id: postId, user_id: user.id });

    if (insertError) {
      if (insertError.code === "23505") {
        // Another request won the race to insert the same like row first.
        revalidatePath("/kudos");
        return { ok: true, skipped: false, liked: true };
      }
      console.error("[kudos actions] toggleLikeAction like failed:", insertError);
      return { ok: false, error: "like_failed" };
    }

    revalidatePath("/kudos");
    return { ok: true, skipped: false, liked: true };
  } catch (err) {
    console.error("[kudos actions] toggleLikeAction unexpected error:", err);
    return { ok: false, error: "unexpected_error" };
  }
}

/**
 * Opens exactly one Secret Box for the signed-in user.
 *
 * The unlock rule comes from the product copy itself: every 5 hearts
 * received on the viewer's own Kudos posts unlocks 1 box. The number of
 * already-opened boxes is persisted in `gift_logs`, so:
 *
 *   unopened = floor(total_hearts_received / 5) - opened
 *
 * The action never trusts the `unopenedCount` displayed in the client UI;
 * it recomputes the entitlement server-side on every call.
 */
export async function openSecretBoxAction(): Promise<OpenSecretBoxResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "unauthenticated" };
    }

    await ensureCurrentProfile(supabase, user);

    const [heartsResult, openedResult] = await Promise.all([
      supabase
        .from("kudos_likes")
        .select("id, kudos!inner(sender_id)", { count: "exact", head: true })
        .eq("kudos.sender_id", user.id),
      supabase
        .from("gift_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    const queryError = heartsResult.error ?? openedResult.error;
    if (queryError) {
      console.error("[kudos actions] openSecretBoxAction count lookup failed:", queryError);
      return { ok: false, error: "secret_box_lookup_failed" };
    }

    const heartsReceived = heartsResult.count ?? 0;
    const openedCount = openedResult.count ?? 0;
    const unlockedCount = getUnlockedSecretBoxCount(heartsReceived);

    if (openedCount >= unlockedCount) {
      return { ok: false, error: "no_secret_box_available" };
    }

    const giftText = getSecretBoxRewardForOpenIndex(openedCount);
    const { error: insertError } = await supabase
      .from("gift_logs")
      .insert({ user_id: user.id, gift_name: giftText });

    if (insertError) {
      console.error("[kudos actions] openSecretBoxAction insert failed:", insertError);
      return { ok: false, error: "open_secret_box_failed" };
    }

    revalidatePath("/kudos");
    return { ok: true, skipped: false, giftText };
  } catch (err) {
    console.error("[kudos actions] openSecretBoxAction unexpected error:", err);
    return { ok: false, error: "unexpected_error" };
  }
}
