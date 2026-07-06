"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";

/**
 * Pencil / "write kudos" icon — MoMorph node
 * `I5022:15169;214:3839;186:1763` (MM_MEDIA_Pen).
 *
 * The MoMorph asset failed to download (expired presigned URL, HTTP 403)
 * and the `get_figma_image` fallback also failed on every node variant
 * tried (HTTP 500 / invalid format). This is a stand-in outline pencil
 * glyph, sized to the same 24x24 box, using `currentColor` so it inherits
 * the button's text color (`#00101A`) — swap in the real export once
 * Figma re-uploads the asset.
 */
function PenIcon() {
  return (
    // mm:I5022:15169;214:3839;186:1763
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sun* Kudos mark — MoMorph node `I5022:15169;214:3839;186:1766;214:3762`
 * (MM_MEDIA_Kudos Logo). Multi-color brand mark (navy `#00101A` + red
 * `#E73928` + white-to-transparent highlight gradients) — kept as the
 * original Figma palette per code-rules 2a (do not flatten to
 * `currentColor` for a ≥2-color logo). Gradient ids are namespaced
 * (`saa-widget-*`) to avoid collisions with other inlined SVGs on the page.
 */
function KudosLogoSmallIcon() {
  return (
    // mm:I5022:15169;214:3839;186:1766;214:3762
    <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.26498 6.93036L11.0701 9.02364C11.657 9.25239 12.1663 9.99475 11.6959 10.8019C11.3851 11.4104 9.06741 13.9353 9.06741 13.9353C9.05447 13.9828 1.57908 11.2076 1.57908 11.2076C0.970522 10.9745 0.616607 10.34 0.815145 9.60199C1.01368 8.86395 4.56147 6.64982 5.26498 6.92605V6.93036Z"
        fill="#00101A"
      />
      <path
        d="M5.27084 6.9245L11.0759 9.01778C11.6629 9.24653 12.1722 9.98889 11.7017 10.796C11.391 11.4046 9.07327 13.9294 9.07327 13.9294C9.06032 13.9769 1.58494 11.2017 1.58494 11.2017C0.976382 10.9686 0.622466 10.3342 0.821004 9.59613C1.01954 8.85809 4.56733 6.64396 5.27084 6.92019V6.9245Z"
        fill="url(#saa-widget-kudos-gradient-1)"
        style={{ mixBlendMode: "multiply" }}
      />
      <path
        d="M5.26498 6.9245L11.0701 9.01778C11.657 9.24653 12.1663 9.98889 11.6959 10.796C11.3851 11.4046 9.06741 13.9294 9.06741 13.9294C9.05447 13.9769 1.57908 11.2017 1.57908 11.2017C0.970522 10.9686 0.616607 10.3342 0.815145 9.59613C1.01368 8.85809 4.56147 6.64396 5.26498 6.92019V6.9245Z"
        fill="url(#saa-widget-kudos-gradient-2)"
        style={{ mixBlendMode: "multiply" }}
      />
      <path
        d="M12.6925 6.60574C12.904 6.41152 15.9986 3.54999 19.978 0.105785C20.0298 0.0583088 19.978 -0.0236959 19.9132 0.00651633C18.0789 0.943097 14.393 1.80631 14.393 1.80631L6.83133 3.21333C4.25465 3.73989 4.01727 4.17149 2.9771 5.84612L2.70088 6.28204C2.68793 6.30362 2.24769 7.09777 0.832031 9.5536C1.26364 8.80692 1.75135 8.7465 4.65173 8.20268C5.20418 8.08614 6.52057 7.78402 7.34494 7.61569C8.48869 7.38263 12.3861 6.66617 12.6623 6.61437C12.6752 6.61437 12.6796 6.61006 12.6882 6.60143L12.6925 6.60574Z"
        fill="#E73928"
      />
      <path
        d="M2.9608 12.9541L0 18.2758L5.81371 16.9033C8.38607 16.3637 8.62345 15.9321 9.6593 14.2532L9.93552 13.813C9.93552 13.813 10.2679 13.3037 11.6965 10.8047C11.2908 11.547 9.69814 11.5341 7.98036 11.9053C7.4279 12.0261 2.96512 12.9541 2.96512 12.9541H2.9608Z"
        fill="#E73928"
      />
      <defs>
        <linearGradient
          id="saa-widget-kudos-gradient-1"
          x1="8.11511"
          y1="14.4258"
          x2="5.37011"
          y2="7.80498"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.32" stopColor="#FDFCFD" />
          <stop offset="0.47" stopColor="#F9F5F6" />
          <stop offset="0.57" stopColor="#F2E9EA" />
          <stop offset="0.66" stopColor="#E8D7DA" />
          <stop offset="0.74" stopColor="#DABFC4" />
          <stop offset="0.81" stopColor="#CAA3AA" />
          <stop offset="0.87" stopColor="#B6818B" />
          <stop offset="0.93" stopColor="#A05966" />
          <stop offset="0.98" stopColor="#872D3E" />
          <stop offset="1" stopColor="#7E1E30" />
        </linearGradient>
        <linearGradient
          id="saa-widget-kudos-gradient-2"
          x1="6.73675"
          y1="10.878"
          x2="8.8214"
          y2="14.6847"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.22" stopColor="#FCFCFC" />
          <stop offset="0.35" stopColor="#F3F3F3" />
          <stop offset="0.47" stopColor="#E5E5E5" />
          <stop offset="0.57" stopColor="#D0D0D0" />
          <stop offset="0.66" stopColor="#B5B5B5" />
          <stop offset="0.75" stopColor="#959595" />
          <stop offset="0.83" stopColor="#6D6D6D" />
          <stop offset="0.91" stopColor="#404040" />
          <stop offset="0.98" stopColor="#0E0E0E" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Floating "Widget Button" — MoMorph node `5022:15169`
 * (mms_6_Widget Button, spec item "6"): a fixed pill, bottom-right of the
 * viewport, that opens a quick-actions menu ("write kudos" pen glyph and
 * the SAA rules / Kudos mark, separated by a "/").
 *
 * Open/close state comes from `useDismissableMenu` (shared with the
 * notification bell and account menu, for consistent outside-click/Escape
 * dismissal). The design defines the trigger + separator glyph but no menu
 * content, so the open panel is a minimal "Sắp ra mắt" (Coming soon) stub —
 * same empty-state pattern as `notification-bell.tsx`'s "Chưa có thông báo"
 * panel — rather than inventing menu items (clarifications.md, F002 session
 * 2026-07-06: "widget mở menu stub").
 */
export function WidgetButton() {
  const { open, containerRef, triggerProps } = useDismissableMenu();

  return (
    // mm:5022:15169
    <div ref={containerRef} className="fixed right-[19px] bottom-6 z-40">
      {/* mm:I5022:15169;214:3839 */}
      <button
        type="button"
        aria-label="Quick actions"
        {...triggerProps}
        style={{
          boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287",
        }}
        className="flex h-16 w-[106px] items-center justify-start gap-2 rounded-full bg-[#FFEA9E] p-4 text-[#00101A] transition-transform duration-200 ease-out hover:scale-105"
      >
        {/* mm:I5022:15169;214:3839;186:1935 */}
        <span className="flex h-8 w-[42px] items-center gap-2">
          <PenIcon />
          {/* mm:I5022:15169;214:3839;186:1568 */}
          <span className="font-montserrat text-2xl leading-8 font-bold">
            /
          </span>
        </span>
        {/* mm:I5022:15169;214:3839;186:1766 */}
        <span className="flex h-6 w-6 items-center justify-center">
          <KudosLogoSmallIcon />
        </span>
      </button>
      {open && (
        // `role="status"`, not `menu` — plain informational text with no
        // `menuitem` children (same rationale as `notification-bell.tsx`).
        <div
          role="status"
          aria-label="Quick actions"
          className="absolute right-0 bottom-20 z-40 w-64 rounded-lg border border-[#2E3940] bg-[#101317] p-4 text-sm text-white shadow-lg"
        >
          Sắp ra mắt
        </div>
      )}
    </div>
  );
}
