"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Click handler for links that point at `/` (the logo, and the selected
 * "About SAA 2025" nav link) — FR-6/FR-7/FR-26. Next.js's `<Link>` treats
 * navigating to the current URL as a no-op, so without this a click while
 * already on `/` would otherwise do nothing; this scrolls the page back to
 * the top instead. Links to other routes (`href !== "/"`) are left alone —
 * the browser handles the real navigation.
 */
export function useScrollToTopOnHomeClick(href: string): () => void {
  const pathname = usePathname();

  return useCallback(() => {
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [href, pathname]);
}
