"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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
        className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-white px-3 text-sm font-bold text-ink hover:bg-surface"
      >
        <Flag locale={locale} />
        <span className="hidden sm:inline">{localeLabels[locale].label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-[14px] border border-line bg-white shadow-lg">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-ink hover:bg-surface"
            >
              <Flag locale={l} />
              {localeLabels[l].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
