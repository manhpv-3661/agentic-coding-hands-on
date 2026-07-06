import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";

export const metadata: Metadata = {
  title: "Awards Information | Sun* Annual Awards 2025",
  description: "Thông tin các hạng mục giải thưởng Sun* Annual Awards 2025.",
};

/**
 * Placeholder "Awards Information" screen.
 *
 * The real design lands in a later screen — this exists so the header/footer
 * links, homepage award-grid CTAs, and hash-anchor links (`/awards#<slug>`)
 * all have a real target to scroll to. One `<section id={slug}>` per
 * category, sourced from `lib/awards/award-categories.ts` (single source of
 * truth shared with the homepage award cards).
 *
 * Protected: gated by `proxy.ts` matcher (P01) + `requireUser()` here
 * (defense-in-depth).
 */
export default async function AwardsPage() {
  await requireUser();

  return (
    <main className="flex flex-1 flex-col gap-16 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Awards Information
      </h1>
      {AWARD_CATEGORIES.map((category) => (
        <section
          key={category.slug}
          id={category.slug}
          className="scroll-mt-24"
        >
          <h2 className="text-xl font-medium">{category.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Nội dung chi tiết sẽ được cập nhật.
          </p>
        </section>
      ))}
    </main>
  );
}
