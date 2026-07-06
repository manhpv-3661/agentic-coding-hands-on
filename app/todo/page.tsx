import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Placeholder main page after login (real content is a separate screen).
 * Exists so the post-login redirect + access-control E2E have a real target.
 * The proxy already gates this route; the server-side check here is
 * defense-in-depth.
 */
export default async function TodoPage() {
  const email = await getSignedInEmail();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">SAA 2025 — Todo</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        {email ? (
          <>
            Đã đăng nhập với <span className="font-medium">{email}</span>
          </>
        ) : (
          "Trang chính (placeholder)."
        )}
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Đăng xuất
        </button>
      </form>
    </main>
  );
}

async function getSignedInEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

async function signOut() {
  "use server";
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
