/**
 * Homepage event facts stay in the agreed hardcode scope for this mock
 * project. Keep the repository API, but return the local config-backed
 * values directly instead of querying Supabase.
 */
export interface EventSettings {
  eventName: string;
  venueName: string;
}

/** Verbatim mirror of the seeded `event_settings` row (`supabase/seed.sql`)
 * — the exact strings that were previously hardcoded across the homepage,
 * so the authless e2e build (port 3100, no Supabase env) keeps rendering
 * identically. */
const EVENT_SETTINGS_FALLBACK: EventSettings = {
  eventName: "Sun* Annual Awards 2025",
  venueName: "Âu Cơ Art Center",
};

/**
 * Stable repository boundary for the single homepage event settings object.
 */
export async function getEventSettings(): Promise<EventSettings> {
  return EVENT_SETTINGS_FALLBACK;
}
