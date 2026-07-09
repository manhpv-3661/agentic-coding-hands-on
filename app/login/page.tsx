import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginButtonContainer } from "./components/login-button-container";
import { LoginFooter } from "./components/login-footer";
import { LoginHeader } from "./components/login-header";
import { LoginHeroContent } from "./components/login-hero-content";
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
 * Supabase env is absent. */
async function redirectIfAuthenticated() {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");
}

/**
 * Login screen.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
 *
 * Background note: the hero art (Figma node `662:14389`, "image 1") isn't a
 * tagged `MM_MEDIA_*` asset and `get_figma_image`/`get_media_file` are
 * unauthorized/500 for it, so there's no clean source export from MoMorph.
 * `/public/login/hero-waves.jpg` is therefore a crop of the design's own
 * 1440x1024 frame render (x≥620, header+footer bands removed) so it holds
 * ONLY the wave artwork — no baked wordmark/body/logo/selector to ghost
 * against the real DOM content. Rendered as a sized keyvisual box (see
 * `keyvisualBoxClassName` below), NOT a page-wide `bg-cover` — the box is
 * 1441x1022 (Figma's own box for `662:14389`, x:0 y:2 in the 1440x1024 root
 * frame), right-anchored via `bg-right` so the waves stay in view under
 * `bg-cover` scaling against the substitute asset's own aspect ratio. Since
 * the substitute is a crop, not the original crop-transformed layer, this is
 * a documented reconstruction tuned to the substitute asset, not a claim of
 * pixel-perfect fidelity. The left→right dark scrim painted over the image in
 * the same box mirrors Figma's `Rectangle 57` (662:14392) fade exactly: a
 * flat opaque `#00101A` band held through the first 25.41% of width, then a
 * single fade to transparent by 100%.
 *
 * A second, independent overlay (rendered just above the footer below)
 * reproduces the design's
 * `Cover` layer (662:14390) — a vertical, x-independent fade that darkens the
 * lower portion of the frame toward solid `#00101A` at the bottom, sitting
 * above the hero content and below the footer in paint order (same as the
 * Figma z-order: content -> Cover -> Footer). It stays a separate, full-width
 * overlay (not nested inside the keyvisual box) because the Cover fade is
 * itself x-independent, so scoping it to the 1441px box would add nothing.
 */
const keyvisualBoxClassName =
  "pointer-events-none absolute left-0 top-[2px] -z-10 h-[1022px] w-[1441px] bg-[linear-gradient(to_right,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%),url('/login/hero-waves.jpg')] bg-cover bg-right bg-no-repeat";
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
      <div aria-hidden className={keyvisualBoxClassName} />
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
