"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Map } from "lucide-react";
import { localizedName, type City } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Button, Card, Select } from "@/components/ui";
import { importOsmForCity, type OsmImportResult } from "./actions";

export function ImportOsmClient({ cities }: { cities: City[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [cityId, setCityId] = useState("");
  const [result, setResult] = useState<OsmImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    if (!cityId) return;
    setResult(null);
    startTransition(async () => {
      setResult(await importOsmForCity(Number(cityId)));
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        {t("osmTitle")}
      </h1>

      <Card className="space-y-4">
        <p className="text-sm text-muted">{t("osmHint")}</p>
        <Select value={cityId} onChange={(e) => setCityId(e.target.value)}>
          <option value="">{t("osmChooseCity")}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {localizedName(c, locale)}
            </option>
          ))}
        </Select>
        <Button onClick={run} disabled={pending || !cityId} className="w-full">
          <Map className="h-[18px] w-[18px]" />
          {pending ? t("osmRunning") : t("osmRun")}
        </Button>
        {result &&
          (result.error ? (
            <p className="rounded-[14px] bg-[#FFE4DC] p-3 text-sm text-[#A3241A]">
              {tc("error")} ({result.error})
            </p>
          ) : (
            <p className="rounded-[14px] bg-[#DCEDEA] p-3 text-sm font-semibold text-[#0B443E]">
              {t("osmResult", {
                found: result.found,
                imported: result.imported,
                skipped: result.skipped,
              })}
            </p>
          ))}
        <p className="text-[11px] text-faint">
          Të dhënat: © OpenStreetMap contributors (ODbL)
        </p>
      </Card>
    </div>
  );
}
