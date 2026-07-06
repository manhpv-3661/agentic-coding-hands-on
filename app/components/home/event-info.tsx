/**
 * Event info block for the Homepage SAA hero — MoMorph node `2167:9053`
 * (mms_B2_Thông tin sự kiện).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Static/presentational: date, venue, and livestream note are copied
 * verbatim from the Figma text layers (no invented copy).
 */
export function EventInfo() {
  return (
    // mm:2167:9053
    <div className="flex flex-col items-start gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-[60px]">
        {/* mm:2167:9055 */}
        <div className="flex items-baseline gap-1">
          {/* mm:2167:9056 */}
          <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-white">
            Thời gian:{" "}
          </span>
          {/* mm:2167:9057 */}
          <span className="font-montserrat text-2xl leading-8 font-bold text-[#FFEA9E]">
            26/12/2025
          </span>
        </div>
        {/* mm:2167:9058 */}
        <div className="flex items-baseline gap-1">
          {/* mm:2167:9060 */}
          <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-white">
            Địa điểm:
          </span>
          {/* mm:2167:9059 */}
          <span className="font-montserrat text-2xl leading-8 font-bold text-[#FFEA9E]">
            Âu Cơ Art Center
          </span>
        </div>
      </div>
      {/* mm:2167:9061 */}
      <p className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-white">
        Tường thuật trực tiếp qua sóng Livestream
      </p>
    </div>
  );
}
