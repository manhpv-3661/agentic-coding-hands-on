import type { SVGProps } from "react";

/**
 * Up-chevron / up-right arrow icon — MoMorph component `186:1441`, reused
 * identically across 3 call sites that used to each carry their own copy:
 * `award-card.tsx`'s "Chi tiết" CTA (master component `178:1020`, instances
 * `mm:I2167:9075;214:1023;186:1441` .. `I2167:9081;214:1023;186:1441`),
 * `hero-cta-buttons.tsx`'s two CTA buttons (`186:2691`, MM_MEDIA_Up), and
 * `sun-kudos-section.tsx`'s "Chi tiết" CTA
 * (`I3390:10349;313:8426;186:1766`). Figma's exported asset ships with a
 * hardcoded `fill="white"`; inlined here with `currentColor` so each
 * caller's own text color drives the icon color (code-rules.md rule 2a).
 */
export function UpChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}
