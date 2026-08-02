"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Category, City } from "@/lib/types";
import { NewBusinessForm } from "@/app/(portal)/businesses/new/new-business-form";

/** Inhaber-Schalter + Erfassungs-Wizard (FF-Variante: source 'self', keine Vergütung) */
export function FFAddBusinessClient({
  cities,
  categories,
  defaultMine,
}: {
  cities: City[];
  categories: Category[];
  defaultMine: boolean;
}) {
  const t = useTranslations("ff");
  const [mine, setMine] = useState(defaultMine);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full border-[1.5px] border-line bg-white px-4 py-2.5">
        <input
          type="checkbox"
          checked={mine}
          onChange={(e) => setMine(e.target.checked)}
          className="h-5 w-5 accent-[#12574F]"
        />
        <span className="text-[14.5px] font-bold text-ink">
          {t("thisIsMine")}
        </span>
      </label>
      <NewBusinessForm
        cities={cities}
        categories={categories}
        variant="ff"
        claimOwner={mine}
      />
    </div>
  );
}
