"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { ChevronDownIcon } from "./chevron-down-icon";

interface LanguageSelectorProps {
  /** Locale resolved server-side from the `NEXT_LOCALE` cookie — seeds the
   * trigger so a reload never flashes the wrong language (see FR-5). */
  initialLocale: Locale;
}

const LOCALE_LABEL: Record<Locale, string> = {
  vi: "VN",
  en: "EN",
};

const LOCALE_OPTION_LABEL: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function setLocaleCookie(locale: Locale) {
  document.cookie = `${NEXT_LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * VN/EN language selector from the header (MoMorph node
 * `I662:14391;186:1601` / component "Language").
 *
 * This toggles the `NEXT_LOCALE` cookie and the trigger label, then calls
 * `router.refresh()` — F005 wired real page-content translation on top of
 * this later (server components re-read the cookie on refresh), so
 * selecting a language DOES translate the page now, not just the trigger.
 *
 * Design note: the Figma design only exports a flag asset for Vietnamese
 * (`MM_MEDIA_VN`). No English flag asset exists in the source file, so the
 * trigger keeps showing the VN flag regardless of selection rather than
 * inventing an EN flag icon that isn't part of the design.
 */
export function LanguageSelector({ initialLocale }: LanguageSelectorProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(next: Locale) {
    setLocaleCookie(next);
    setLocale(next);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-[108px] items-center justify-between gap-0.5 rounded-[4px] p-4 text-white transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="flex items-center gap-1">
          <Image src="/login/VN.svg" alt="" width={24} height={24} />
          <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px]">
            {LOCALE_LABEL[locale]}
          </span>
        </span>
        <ChevronDownIcon
          className={`transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-[140px] overflow-hidden rounded-lg border border-[#2E3940] bg-[#0B0F12] shadow-lg"
        >
          {(Object.keys(LOCALE_LABEL) as Locale[]).map((option) => (
            <li key={option} role="option" aria-selected={option === locale}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2.5 text-left font-montserrat text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-white/10 ${
                  option === locale ? "bg-white/5" : ""
                }`}
              >
                {LOCALE_OPTION_LABEL[option]} ({LOCALE_LABEL[option]})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
