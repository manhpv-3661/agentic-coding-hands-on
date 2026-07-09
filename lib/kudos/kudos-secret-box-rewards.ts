/**
 * Secret Box mechanics shared by the sidebar aggregates and the "open box"
 * Server Action.
 *
 * The community-standards copy already defines the one concrete rule we
 * have: every 5 hearts unlocks 1 Secret Box. The product does NOT define
 * reward odds or a separately-managed reward catalog yet, so we keep the
 * reward pool local and deterministic instead of pretending there is a
 * curated admin-managed source.
 */

export const HEARTS_PER_SECRET_BOX = 5;

const SECRET_BOX_REWARD_POOL = [
  "Nhận được icon Revival",
  "Nhận được icon Touch of Light",
  "Nhận được icon Stay Gold",
  "Nhận được icon Flow to Horizon",
  "Nhận được icon Beyond the Boundary",
  "Nhận được icon Root Further",
] as const;

export function getUnlockedSecretBoxCount(heartsReceived: number): number {
  return Math.max(0, Math.floor(heartsReceived / HEARTS_PER_SECRET_BOX));
}

export function getUnopenedSecretBoxCount(
  heartsReceived: number,
  openedCount: number,
): number {
  return Math.max(0, getUnlockedSecretBoxCount(heartsReceived) - Math.max(0, openedCount));
}

export function getSecretBoxRewardForOpenIndex(openIndex: number): string {
  return SECRET_BOX_REWARD_POOL[openIndex % SECRET_BOX_REWARD_POOL.length];
}
