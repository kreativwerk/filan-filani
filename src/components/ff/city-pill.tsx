"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";

export const CITY_COOKIE = "ff_city";

export type FFCityOption = { slug: string; label: string };

function setCityCookie(slug: string) {
  document.cookie = `${CITY_COOKIE}=${slug};path=/;max-age=31536000;samesite=lax`;
}

/** Stadt-Pill im Header: öffnet die Stadt-Auswahl, merkt sich die Wahl im Cookie */
export function CityPill({
  current,
  cities,
}: {
  current: FFCityOption;
  cities: FFCityOption[];
}) {
  const t = useTranslations("ff");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function choose(slug: string) {
    setCityCookie(slug);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 flex-none items-center gap-[5px] rounded-[12px] bg-ff-mint-light px-3 text-[13.5px] font-bold text-ff-primary-dark"
      >
        <MapPin className="h-[15px] w-[15px]" />
        {current.label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <div className="text-[19px] font-extrabold tracking-[-0.015em] text-ink">
                {t("chooseCity")}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("chooseCity")}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-3 pb-6">
              {cities.map((c) => {
                const active = c.slug === current.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => choose(c.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[12px] px-3 py-3 text-left text-[15px]",
                      active
                        ? "bg-ff-mint font-extrabold text-ff-primary-dark"
                        : "font-semibold text-ink-2 hover:bg-surface",
                    )}
                  >
                    {c.label}
                    {active && <Check className="h-[18px] w-[18px]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
