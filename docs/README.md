# Docs Index — SAA 2025 Web

Mock/training front-end project. Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4,
auth via Supabase (Google OAuth). Spec language: **vi**.

## System
- [`system/architecture.md`](system/architecture.md) — components, auth data flow, tech decisions.
- [`system/permissions.md`](system/permissions.md) — roles, route access matrix, security notes.

## Features
- [`features/f001-login/feature.md`](features/f001-login/feature.md) — F001 Login screen spec.
- [`features/f002-homepage/feature.md`](features/f002-homepage/feature.md) — F002 Homepage SAA spec.
- [`features/f003-countdown-prelaunch/feature.md`](features/f003-countdown-prelaunch/feature.md) —
  F003 Countdown Prelaunch (site-wide time-gate) spec.

## Local setup
1. Copy `.env.local.example` → `.env.local`; fill `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase Dashboard → Project Settings → API).
2. Supabase Dashboard → Authentication → Providers → enable Google.
3. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs → add
   `http://localhost:3000/auth/callback`.
4. Without env vars the app still builds/runs (`proxy.ts` fails open) but sign-in won't work.

## Commands
- `npm run dev` / `npm run build` / `npm start`
- `npm run lint`
- `npm test` (Vitest, unit)
- `npm run e2e` (Playwright, E2E)
