export interface EventInfoProps {
  /** "Thời gian: " / "Time:" label (`homepage.hero.eventInfo.timeLabel`). */
  timeLabel: string;
  /** "Địa điểm:" / "Venue:" label (`homepage.hero.eventInfo.venueLabel`). */
  venueLabel: string;
  /** Livestream note (`homepage.hero.eventInfo.livestreamNote`). */
  livestreamNote: string;
  /** Event date value (`homepage.hero.eventDate`) — translation-as-data,
   * see `lib/i18n/dictionaries/vi.ts`/`en.ts`. */
  eventDate: string;
}

/**
 * Event info block for the Homepage SAA hero — MoMorph node `2167:9053`
 * (mms_B2_Thông tin sự kiện).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Static/presentational: labels + date are threaded in from the dictionary
 * (F005). The venue name, "Âu Cơ Art Center", is a proper noun and stays
 * hardcoded across both locales per `clarifications.md`.
 */
export function EventInfo({ timeLabel, venueLabel, livestreamNote, eventDate }: EventInfoProps) {
  return (
    // mm:2167:9053
    <div className="flex flex-col items-start gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-[60px]">
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
              literal across both locales (not sourced from the dictionary). */}
          <span className="font-montserrat text-2xl leading-8 font-bold text-[#FFEA9E]">
            Âu Cơ Art Center
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
