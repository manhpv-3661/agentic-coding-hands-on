import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginButtonContainer } from "./components/login-button-container";
import { LoginFooter } from "./components/login-footer";
import { LoginHeader } from "./components/login-header";
import { LoginHeroContent } from "./components/login-hero-content";
import { LoginKeyvisualBackground } from "./components/login-keyvisual-background";
import { ContentFrame, PageGutter } from "../components/layout/page-layout";
import { montserrat, montserratAlternates } from "./fonts";

/** Locale-aware `<title>`/description — reads the `NEXT_LOCALE` cookie via
 * `getLocale()`, same source of truth the page body uses below. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = getDictionary(locale);

  return {
    title: d.login.meta.title,
    description: d.login.meta.description,
  };
}

/** Already-authenticated users skip the login screen (defense-in-depth
 * alongside proxy.ts, which redirects this same case to `/` — kept in sync
 * so this fallback can never disagree with the real gate). No-op when
 * Supabase env is absent. `getUser()` is wrapped so a transient Supabase
 * Auth failure just renders the login page (proxy.ts remains the real
 * gate) instead of crashing this page render — review finding, same class
 * of gap as `proxy.ts`'s own `getUser()` call. */
async function redirectIfAuthenticated() {
  if (!isSupabaseConfigured()) return;

  // `redirect()` throws internally (Next.js's own control-flow signal) and
  // must NOT be caught, so it's called after — not inside — the try block.
  let isAuthenticated = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);
  } catch (err) {
    console.error("[login page] redirectIfAuthenticated getUser() threw:", err);
  }

  if (isAuthenticated) redirect("/");
}

/**
 * Login screen.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
 *
 * Hero keyvisual background: see `LoginKeyvisualBackground` for the crop
 * source and responsive-sizing rationale.
 *
 * A second, independent overlay (rendered just above the footer below)
 * reproduces the design's
 * `Cover` layer (662:14390) — a vertical, x-independent fade that darkens the
 * lower portion of the frame toward solid `#00101A` at the bottom, sitting
 * above the hero content and below the footer in paint order (same as the
 * Figma z-order: content -> Cover -> Footer). It stays a separate, full-width
 * overlay (not nested inside the keyvisual box) because the Cover fade is
 * itself x-independent, so scoping it to that box would add nothing.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();

  const locale = await getLocale();
  const d = getDictionary(locale);

  const { error } = await searchParams;
  const initialError = error === "auth_callback_failed" ? d.login.error.oauthFailed : null;

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-[#00101A]`}
    >
      <LoginKeyvisualBackground />
      <LoginHeader initialLocale={locale} />
      <PageGutter as="main" className="flex flex-1 items-center py-24">
        {/* Content max-width cap (Figma `Main` node: 1152 = 1440 − 2×144 page
            gutter) — without this, content grows unbounded past the native
            1440px design frame on wider viewports. See
            `.claude/rules/momorph/momorph-layout-system.md`. */}
        <ContentFrame width={1152}>
          <LoginHeroContent subtitle={d.login.hero.subtitle}>
            <LoginButtonContainer
              initialError={initialError}
              oauthFailed={d.login.error.oauthFailed}
              notConfigured={d.login.error.notConfigured}
              loading={d.login.button.loading}
              google={d.login.button.google}
            />
          </LoginHeroContent>
        </ContentFrame>
      </PageGutter>
      {/* Cover (662:14390): x-independent bottom fade to solid #00101A. Paints
          above the static <main> content and below the positioned <footer>
          (z-10) — see the JSDoc above for why that ordering falls out of the
          normal CSS paint order without extra z-index tuning. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35vh] bg-[linear-gradient(to_bottom,transparent_0%,#00101A_89%)]"
      />
      <LoginFooter copyright={d.shared.footer.copyright} />
    </div>
  );
}
