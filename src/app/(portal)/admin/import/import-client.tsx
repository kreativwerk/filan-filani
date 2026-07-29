"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localizedName, type Category, type City } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Button, Card, SectionLabel } from "@/components/ui";

const COLUMNS = [
  "name",
  "city",
  "category",
  "phone",
  "address",
  "email",
  "website",
  "whatsapp",
  "description",
] as const;

type ColumnName = (typeof COLUMNS)[number];

type ParsedRow = {
  raw: Record<ColumnName, string>;
  cityId: number | null;
  categoryId: number | null;
  valid: boolean;
};

// Minimaler CSV-Parser mit Anführungszeichen-Unterstützung ("a,b";"c""d")
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

export function ImportClient({
  cities,
  categories,
}: {
  cities: City[];
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(
    null,
  );

  const norm = (s: string) => s.trim().toLowerCase();

  function findCity(value: string): number | null {
    const v = norm(value);
    if (!v) return null;
    const hit = cities.find(
      (c) =>
        norm(c.slug) === v ||
        [c.name_sq, c.name_de, c.name_en, c.name_sr].some((n) => norm(n) === v),
    );
    return hit?.id ?? null;
  }

  function findCategory(value: string): number | null {
    const v = norm(value);
    if (!v) return null;
    const hit = categories.find(
      (c) =>
        norm(c.slug) === v ||
        [c.name_sq, c.name_de, c.name_en, c.name_sr].some((n) => norm(n) === v),
    );
    return hit?.id ?? null;
  }

  function handleFile(file: File | null) {
    if (!file) return;
    setResult(null);
    file.text().then((text) => {
      const table = parseCsv(text);
      if (table.length < 2) return setRows([]);
      const header = table[0].map(norm);
      const idx = (col: ColumnName) => header.indexOf(col);
      const parsed: ParsedRow[] = table.slice(1).map((cells) => {
        const raw = Object.fromEntries(
          COLUMNS.map((col) => [col, (cells[idx(col)] ?? "").trim()]),
        ) as Record<ColumnName, string>;
        const cityId = findCity(raw.city);
        const categoryId = findCategory(raw.category);
        return {
          raw,
          cityId,
          categoryId,
          valid: Boolean(raw.name && raw.phone && cityId && categoryId),
        };
      });
      setRows(parsed);
    });
  }

  async function runImport() {
    const valid = rows.filter((r) => r.valid);
    if (!valid.length) return;
    setRunning(true);
    setProgress(0);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let ok = 0;
    let failed = 0;

    for (const r of valid) {
      const { data: business, error } = await supabase
        .from("businesses")
        .insert({
          name: r.raw.name,
          description: r.raw.description || null,
          city_id: r.cityId,
          address: r.raw.address || null,
          phone: r.raw.phone,
          whatsapp: r.raw.whatsapp || null,
          email: r.raw.email || null,
          website: r.raw.website || null,
          status: "approved",
          source: "admin",
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (error || !business) {
        failed++;
      } else {
        await supabase.from("business_categories").insert({
          business_id: business.id,
          category_id: r.categoryId,
        });
        ok++;
      }
      setProgress(ok + failed);
    }

    setResult({ ok, failed });
    setRunning(false);
    setRows([]);
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;
  const template =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent(
      COLUMNS.join(",") +
        "\nAuto Servis Besniku,prishtina,auto-servis,+383 44 123 456,Rr. Ilaz Kodra 12,info@besniku.com,,,Servis i veturave",
    );

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        {t("importCsv")}
      </h1>

      <Card className="space-y-4">
        <p className="text-sm text-muted">{t("importHint")}</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex h-[52px] cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-[16px] font-bold text-white hover:bg-primary-dark">
            <Upload className="h-[18px] w-[18px]" />
            {t("importFile")}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <a
            href={template}
            download="filan-filani-import.csv"
            className="flex h-[52px] items-center gap-2 rounded-full border-[1.5px] border-primary bg-white px-6 text-[16px] font-bold text-primary-dark hover:bg-primary-light/40"
          >
            <Download className="h-[18px] w-[18px]" />
            {t("downloadTemplate")}
          </a>
        </div>
      </Card>

      {result && (
        <Card className="bg-primary-light text-sm font-bold text-primary-dark">
          {t("importDone", { ok: result.ok, failed: result.failed })}
        </Card>
      )}

      {rows.length > 0 && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel>{t("importPreview")}</SectionLabel>
            {invalidCount > 0 && (
              <span className="rounded-full bg-[#FFE4DC] px-2.5 py-1 text-xs font-extrabold text-[#A3241A]">
                {invalidCount} {t("importInvalid")}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  <th className="px-2 py-2">name</th>
                  <th className="px-2 py-2">city</th>
                  <th className="px-2 py-2">category</th>
                  <th className="px-2 py-2">phone</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.valid
                        ? "border-b border-divider"
                        : "border-b border-divider bg-[#FFE4DC]/50"
                    }
                  >
                    <td className="px-2 py-2 font-semibold">{r.raw.name}</td>
                    <td className="px-2 py-2">
                      {r.cityId
                        ? localizedName(
                            cities.find((c) => c.id === r.cityId)!,
                            locale,
                          )
                        : `? ${r.raw.city}`}
                    </td>
                    <td className="px-2 py-2">
                      {r.categoryId
                        ? localizedName(
                            categories.find((c) => c.id === r.categoryId)!,
                            locale,
                          )
                        : `? ${r.raw.category}`}
                    </td>
                    <td className="px-2 py-2">{r.raw.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="mt-2 text-xs text-muted">
                … +{rows.length - 20}
              </p>
            )}
          </div>
          <Button onClick={runImport} disabled={running || !validCount}>
            {running
              ? `${tc("loading")} ${progress}/${validCount}`
              : t("importRun", { count: validCount })}
          </Button>
        </Card>
      )}
    </div>
  );
}
