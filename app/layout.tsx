import type { Metadata } from "next";
import { montserrat, montserratAlternates } from "@/app/fonts";
import { getLocale } from "@/lib/i18n/get-locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Sun* Annual Awards 2025.",
};

/**
 * Bug fix: `<html lang>` was hardcoded to `"vi"`, mismatching the page's
 * actual rendered language once a user switches to EN via the
 * `NEXT_LOCALE` cookie (see `lib/i18n/get-locale.ts`). Async so it can
 * `await getLocale()` — same pattern every page already uses (e.g.
 * `app/page.tsx`, `app/kudos/page.tsx`).
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${montserratAlternates.variable} h-full antialiased`}
    >
      {/*
       * Body wrapper is intentionally gutter-free and max-width-free
       * (site-wide layout system audit,
       * `plans/260707-2337-site-layout-system-audit-fixes/`). `PageGutter`
       * (`app/components/layout/page-layout.tsx`) is the single owner of
       * viewport padding and `ContentFrame` the single owner of max-width —
       * `SiteHeader`/page content apply those themselves. Do not add
       * padding or a max-width here; that would create a second, competing
       * container owner.
       */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
