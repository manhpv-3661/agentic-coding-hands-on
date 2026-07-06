import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Sun* Kudos | Sun* Annual Awards 2025",
  description: "Phong trào ghi nhận Sun* Kudos.",
};

/**
 * Placeholder "Sun* Kudos" screen.
 *
 * The real design lands in a later screen — this exists so the header/footer
 * links and the homepage Kudos block CTA ("Chi tiết" → `/kudos`) have a real
 * target.
 *
 * Protected: gated by `proxy.ts` matcher (P01) + `requireUser()` here
 * (defense-in-depth).
 */
export default async function KudosPage() {
  await requireUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Sun* Kudos</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Nội dung chi tiết sẽ được cập nhật.
      </p>
    </main>
  );
}
