import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginButtonContainer } from "./components/login-button-container";
import { LoginFooter } from "./components/login-footer";
import { LoginHeader } from "./components/login-header";
import { LoginHeroContent } from "./components/login-hero-content";
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
 * against the real DOM content. Used at ALL breakpoints, right-anchored so the
 * waves stay in view when `bg-cover` crops narrow viewports; the left→right
 * dark scrim mirrors Figma's `Rectangle 57` (662:14392) fade exactly: a flat
 * opaque `#00101A` band held through the first 25.41% of width, then a single
 * fade to transparent by 100%.
 *
 * A second, independent overlay (rendered just above the footer below)
 * reproduces the design's
 * `Cover` layer (662:14390) — a vertical, x-independent fade that darkens the
 * lower portion of the frame toward solid `#00101A` at the bottom, sitting
 * above the hero content and below the footer in paint order (same as the
 * Figma z-order: content -> Cover -> Footer).
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
      className={`${montserrat.variable} ${montserratAlternates.variable} relative flex min-h-screen w-full flex-col bg-[#00101A] bg-cover bg-right bg-no-repeat bg-[linear-gradient(to_right,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%),url('/login/hero-waves.jpg')]`}
    >
      <LoginHeader initialLocale={locale} />
      <main className="flex flex-1 items-center px-6 py-12 sm:px-10 lg:px-36 lg:py-24">
        <LoginHeroContent subtitle={d.login.hero.subtitle}>
          <LoginButtonContainer
            initialError={initialError}
            oauthFailed={d.login.error.oauthFailed}
            notConfigured={d.login.error.notConfigured}
            loading={d.login.button.loading}
            google={d.login.button.google}
          />
        </LoginHeroContent>
      </main>
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
