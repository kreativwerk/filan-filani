"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/set-locale";
import { Flag } from "./flags";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function setLocale(next: Locale) {
    setLocaleCookie(next);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={localeLabels[locale].label}
        className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface"
      >
        <Flag locale={locale} className="h-7 w-7" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-[14px] border border-line bg-white shadow-lg">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-semibold text-ink hover:bg-surface"
            >
              <Flag locale={l} className="h-6 w-6" />
              {localeLabels[l].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
