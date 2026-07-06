import Image from "next/image";

/**
 * Full-viewport background image + dark contrast overlay for the Countdown -
 * Prelaunch page. MoMorph:
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 * - mm:2268:35129 "MM_MEDIA_BG Image" — dark background with colorful
 *   organic pattern, downloaded verbatim via MoMorph media API to
 *   `public/prelaunch/bg-image.png` (1512x1077, matches the Figma frame).
 * - mm:2268:35130 "Cover" — semi-transparent dark gradient overlay, exact
 *   value read via MCP `get_node("2268:35130")`, not guessed.
 *
 * Static, no interaction — `aria-hidden` since it carries no information not
 * already conveyed by the page's text content.
 */
export function PrelaunchBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* mm:2268:35129 */}
      <Image
        src="/prelaunch/bg-image.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      {/* mm:2268:35130 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0, 18, 29, 0.46) 52.13%, rgba(0, 19, 32, 0.00) 63.41%)",
        }}
      />
    </div>
  );
}
