export interface EventInfoProps {
  /** "Thời gian: " / "Time:" label (`homepage.hero.eventInfo.timeLabel`). */
  timeLabel: string;
  /** "Địa điểm:" / "Venue:" label (`homepage.hero.eventInfo.venueLabel`). */
  venueLabel: string;
  /** Livestream note (`homepage.hero.eventInfo.livestreamNote`). */
  livestreamNote: string;
  /** Event date value, pre-formatted by `app/page.tsx` via
   * `lib/event/format-event-date.ts` (Intl, derived from the same env-var
   * timestamp that gates the Prelaunch redirect) before being threaded down
   * through `hero-section.tsx`'s `hero.eventDate` — see `app/page.tsx` for
   * the override. No longer a raw dictionary literal. */
  eventDate: string;
  /** Venue name, from `getEventSettings()` (`event_settings.venue_name` —
   * Postgres when configured, the static fallback "Âu Cơ Art Center"
   * otherwise). Threaded down from `app/page.tsx` via `hero-section.tsx`
   * (which gained this one pass-through prop for phase-04 — a plain data
   * value, not hero copy, so it stays within the spirit of that file's
   * "content stays in the dict" scope note even though the file itself
   * needed a small edit; see phase-04 completion report for the full
   * rationale: this component's tests render it synchronously via
   * `@testing-library/react`, which cannot render an async Server
   * Component, so self-fetching here was not viable). Replaces the
   * previously hardcoded literal. */
  venueName: string;
}

/**
 * Event info block for the Homepage SAA hero — MoMorph node `2167:9053`
 * (mms_B2_Thông tin sự kiện).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Static/presentational: labels + date + venue are all threaded in as
 * props (F005 + phase-04). The venue name is real data now
 * (`event_settings.venue_name`) rather than the proper-noun literal that
 * used to be hardcoded directly in this file.
 */
export function EventInfo({
  timeLabel,
  venueLabel,
  livestreamNote,
  eventDate,
  venueName,
}: EventInfoProps) {
  return (
    // mm:2167:9053
    <div className="flex flex-col items-start gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-row items-center gap-15">
        {/* mm:2167:9055 */}
        <div className="flex items-baseline gap-1">
          {/* mm:2167:9056 */}
          <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-white">
            {timeLabel}
          </span>
          {/* mm:2167:9057 */}
          <span className="font-montserrat text-2xl leading-8 font-bold text-[#FFEA9E]">
            {eventDate}
          </span>
        </div>
        {/* mm:2167:9058 */}
        <div className="flex items-baseline gap-1">
          {/* mm:2167:9060 */}
          <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-white">
            {venueLabel}
          </span>
          {/* mm:2167:9059 — "Âu Cơ Art Center" is a proper noun, kept
              identical across both locales — now sourced from
              `event_settings.venue_name` via the `venueName` prop instead
              of a hardcoded literal. */}
          <span className="font-montserrat text-2xl leading-8 font-bold text-[#FFEA9E]">
            {venueName}
          </span>
        </div>
      </div>
      {/* mm:2167:9061 */}
      <p className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-white">
        {livestreamNote}
      </p>
    </div>
  );
}
