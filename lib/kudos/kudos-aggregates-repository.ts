// server-only: uses `createClient()` from lib/supabase/server.ts, which reads
// request cookies via `next/headers`. Never import this from a Client
// Component (mirrors the convention in lib/kudos/kudos-repository.ts).
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatSupabaseError } from "@/lib/supabase/format-error";
import {
  getUnopenedSecretBoxCount,
  getUnlockedSecretBoxCount,
} from "./kudos-secret-box-rewards";
import type { GiftRecipient, KudosStats } from "./kudos-types";
import {
  KUDOS_STATS,
  RECENT_GIFT_RECIPIENTS,
  SPOTLIGHT_NAMES,
  SPOTLIGHT_TOTAL,
} from "./kudos-data";
import { SPOTLIGHT_NAME_SLOTS } from "./spotlight-name-cloud-slots";

/**
 * Data-access layer for the Kudos board's sidebar aggregates.
 *
 * Final agreed scope:
 * - sidebar stats: real Supabase data
 * - recent gift recipients: real Supabase data
 * - Spotlight Board: hardcoded local content, not DB-backed
 */

/**
 * Sidebar stats (FR-18) for the CURRENT user.
 *
 * - `sent` / `hearts` are exact.
 * - `received` is exact because the simplified schema stores `receiver_id`.
 * - Secret Box counts are derived from the product rule in community
 *   standards copy:
 *     every 5 hearts on Kudos you sent unlocks 1 Secret Box
 *     opened = count(gift_logs where user_id = current user)
 *     unopened = unlocked - opened
 *
 * Mock mode, or no authenticated user, still returns `KUDOS_STATS`
 * unchanged so the authless training build keeps rendering.
 */
export async function getKudosSidebarStats(user: User | null): Promise<KudosStats> {
  if (!isSupabaseConfigured() || !user) {
    return KUDOS_STATS;
  }

  const supabase = await createClient();
  const [sentResult, heartsResult, openedResult, receivedResult] = await Promise.all([
    supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id),
    supabase
      .from("kudos_likes")
      .select("id, kudos!inner(sender_id)", { count: "exact", head: true })
      .eq("kudos.sender_id", user.id),
    supabase
      .from("gift_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id),
  ]);

  const queryError =
    sentResult.error ?? heartsResult.error ?? openedResult.error ?? receivedResult.error;
  if (queryError) {
    console.error(
      "[kudos-aggregates-repository] getKudosSidebarStats count query failed, returning zeroed real-mode stats:",
      formatSupabaseError(queryError),
    );
    return {
      received: 0,
      sent: 0,
      hearts: 0,
      secretBoxOpened: 0,
      secretBoxUnopened: 0,
    };
  }

  const heartsReceived = heartsResult.count ?? 0;
  const openedCount = openedResult.count ?? 0;

  return {
    sent: sentResult.count ?? 0,
    received: receivedResult.count ?? 0,
    hearts: heartsReceived,
    secretBoxOpened: Math.min(openedCount, getUnlockedSecretBoxCount(heartsReceived)),
    secretBoxUnopened: getUnopenedSecretBoxCount(heartsReceived, openedCount),
  };
}

export async function getSpotlightTotal(): Promise<number> {
  return SPOTLIGHT_TOTAL;
}

export async function getSpotlightNames(): Promise<string[]> {
  return SPOTLIGHT_NAMES.slice(0, SPOTLIGHT_NAME_SLOTS.length);
}

/**
 * Top-10 "SUNNER NHẬN QUÀ MỚI NHẤT" list, read from the real
 * `gift_logs` history. Mock mode still returns the
 * placeholder rows; configured mode returns only real openings (or `[]`
 * when none exist yet).
 */
export async function getGiftRecipients(): Promise<GiftRecipient[]> {
  if (!isSupabaseConfigured()) {
    return RECENT_GIFT_RECIPIENTS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gift_logs")
    .select("gift_name, created_at, user:profiles!gift_logs_user_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    console.error(
      "[kudos-aggregates-repository] getGiftRecipients failed, returning no recipients in configured mode:",
      formatSupabaseError(error),
    );
    return [];
  }

  return data.map((row) => ({
    name: (row.user as { full_name?: string } | null)?.full_name ?? "",
    gift: row.gift_name as string,
  }));
}
