import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginButtonContainer } from "./components/login-button-container";
import { LoginFooter } from "./components/login-footer";
import { LoginHeader } from "./components/login-header";
import { LoginHeroContent } from "./components/login-hero-content";
import { montserrat, montserratAlternates } from "./fonts";

export const metadata: Metadata = {
  title: "Đăng nhập | Sun* Annual Awards 2025",
  description: "Đăng nhập để khám phá Sun* Annual Awards 2025.",
};

const LOGIN_ERROR = "Đăng nhập không thành công. Vui lòng thử lại.";

/** Already-authenticated users skip the login screen (defense-in-depth
 * alongside proxy.ts). No-op when Supabase env is absent. */
async function redirectIfAuthenticated() {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/todo");
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
 * dark scrim (mirroring Figma's `Rectangle 57` fade over `#00101A`) keeps the
 * left-aligned text readable over the bright waves at every width.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();

  const { error } = await searchParams;
  const initialError = error === "auth_callback_failed" ? LOGIN_ERROR : null;

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative flex min-h-screen w-full flex-col bg-[#00101A] bg-cover bg-right bg-no-repeat [background-image:linear-gradient(to_right,rgba(0,16,26,0.95),rgba(0,16,26,0.6)_40%,rgba(0,16,26,0.15)_70%,transparent_100%),url('/login/hero-waves.jpg')]`}
    >
      <LoginHeader />
      <main className="flex flex-1 items-center px-6 py-12 sm:px-10 lg:px-36">
        <LoginHeroContent>
          <LoginButtonContainer initialError={initialError} />
        </LoginHeroContent>
      </main>
      <LoginFooter />
    </div>
  );
}
