import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  CURRENT_USER,
  KUDOS_POSTS,
  KUDOS_STATS,
  RECENT_GIFT_RECIPIENTS,
  SPOTLIGHT_NAMES,
  SPOTLIGHT_TOTAL,
} from "@/lib/kudos/kudos-data";
import {
  getDistinctDepartments,
  getDistinctHashtags,
  getDistinctRecipients,
} from "@/lib/kudos/kudos-selectors";
import { KudosPageClient } from "../components/kudos/kudos-page-client";
import { KudosSidebar } from "../components/kudos/kudos-sidebar";
import { SpotlightBoard } from "../components/kudos/spotlight-board";
import { SiteFooter } from "../components/home/site-footer";
import { SiteHeader } from "../components/home/site-header";
import { montserrat, montserratAlternates } from "../login/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return {
    title: "Sun* Kudos | Sun* Annual Awards 2025",
    description: dictionary.kudos.meta.description,
  };
}

/**
 * "Sun* Kudos - Live board" screen (F006), replacing the F002 placeholder.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
 *
 * Protected route: gated by `proxy.ts` (P01) and `requireUser()` below
 * (server-side defense-in-depth, unchanged from the placeholder).
 *
 * Composition (spec §1, extended by F007): `SiteHeader` → `KudosPageClient`
 * (client: F007's wrapper — owns the compose dialog's open/close state AND
 * the session-scoped `posts` list) which renders `KudosBanner` (banner +
 * the now-live "Ghi nhận" composer pill) → `KudosBoard` (client: the SINGLE
 * hashtag/department filter-state holder) — Highlight Kudos carousel +
 * filters, the server-rendered Spotlight Board slot, All Kudos feed +
 * server-rendered sidebar slot — → `ComposeDialog` (F007's "Viết Kudos"
 * form) → `SiteFooter`.
 *
 * `page.tsx` stays a Server Component (`requireUser()` + locale/dict +
 * static data wiring, mirrors `app/awards/page.tsx`); only `KudosPageClient`
 * and its descendants (board, carousel, spotlight search/pan-zoom,
 * copy-link, open-gift dialog, compose dialog) cross into `"use client"`.
 * `app/layout.tsx` renders only `html`/`body`, so this page renders
 * `SiteHeader`/`SiteFooter` itself, same as `app/page.tsx`/`app/awards/page.tsx`.
 *
 * `SpotlightBoard` and `KudosSidebar` are rendered here (server) and
 * passed into `KudosBoard` as slot props (`spotlight`/`sidebar`) so the
 * sidebar's presentational tree never enters the client bundle — only
 * `SpotlightBoard` itself is a client component (owns its own search/
 * pan-zoom state, independent of the shared filter).
 */
export default async function KudosPage() {
  await requireUser();

  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const hashtagOptions = getDistinctHashtags(KUDOS_POSTS);
  const departmentOptions = getDistinctDepartments(KUDOS_POSTS);
  const recipientOptions = getDistinctRecipients(KUDOS_POSTS, CURRENT_USER);

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} flex min-h-screen w-full flex-col bg-[#00101A]`}
    >
      <SiteHeader
        locale={locale}
        nav={dictionary.shared.nav}
        account={dictionary.shared.account}
        notifications={dictionary.shared.notifications}
      />

      <main className="flex flex-1 flex-col gap-16 pb-16">
        <KudosPageClient
          initialPosts={KUDOS_POSTS}
          currentUser={CURRENT_USER}
          recipientOptions={recipientOptions}
          hashtagOptions={hashtagOptions}
          departmentOptions={departmentOptions}
          labels={dictionary.kudos}
          spotlight={
            <SpotlightBoard
              names={SPOTLIGHT_NAMES}
              total={SPOTLIGHT_TOTAL}
              labels={dictionary.kudos.spotlight}
            />
          }
          sidebar={
            <KudosSidebar
              stats={KUDOS_STATS}
              recipients={RECENT_GIFT_RECIPIENTS}
              labels={dictionary.kudos}
            />
          }
        />
      </main>

      <SiteFooter nav={dictionary.shared.nav} footer={dictionary.shared.footer} />
    </div>
  );
}
