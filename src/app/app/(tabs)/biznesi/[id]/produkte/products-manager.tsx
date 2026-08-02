"use client";

/* Mini-Katalog des Inhabers: Produkte anlegen, aktiv/inaktiv schalten,
   löschen (mit confirm). Client-seitig via Supabase; RLS "products: betrieb
   pflegt" erlaubt das nur dem Inhaber des Betriebs. */

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/components/ui";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  photo_url: string | null;
  active: boolean;
  created_at: string;
};

function formatPrice(p: Product): string {
  return `${Number(p.price).toFixed(2).replace(".", ",")} ${
    p.currency === "EUR" ? "€" : p.currency
  }`;
}

export function ProductsManager({
  businessId,
  initial,
}: {
  businessId: string;
  initial: Product[];
}) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const [items, setItems] = useState<Product[]>(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const parsed = Number.parseFloat(price.replace(",", "."));
    const { data, error: insErr } = await supabase
      .from("products")
      .insert({
        business_id: businessId,
        name: name.trim(),
        price: Number.isFinite(parsed) ? parsed : null,
        description: description.trim() || null,
      })
      .select("id, name, description, price, currency, photo_url, active, created_at")
      .single();
    setBusy(false);
    if (insErr || !data) {
      setError(tc("error"));
      return;
    }
    setItems((list) => [data as Product, ...list]);
    setName("");
    setPrice("");
    setDescription("");
  }

  async function toggleActive(p: Product) {
    setError(null);
    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("products")
      .update({ active: !p.active })
      .eq("id", p.id);
    if (updErr) {
      setError(tc("error"));
      return;
    }
    setItems((list) =>
      list.map((it) => (it.id === p.id ? { ...it, active: !p.active } : it)),
    );
  }

  async function handleDelete(p: Product) {
    if (!window.confirm(t("productDeleteConfirm"))) return;
    setError(null);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", p.id);
    if (delErr) {
      setError(tc("error"));
      return;
    }
    setItems((list) => list.filter((it) => it.id !== p.id));
  }

  const input =
    "h-[50px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none";

  return (
    <div className="flex flex-col gap-4 lg:max-w-2xl">
      {/* Neues Produkt */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-5"
      >
        <div className="text-[15px] font-extrabold text-ink">
          {t("productNew")}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("productName")}
          required
          className={input}
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t("productPrice")}
          inputMode="decimal"
          className={input}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("productDesc")}
          rows={2}
          className="w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
        />
        {error && (
          <p className="text-[14px] font-semibold text-alert">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-ff-primary text-[15px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-[18px] w-[18px]" />
          {busy ? tc("loading") : t("productNew")}
        </button>
      </form>

      {/* Liste */}
      {items.length === 0 ? (
        <p className="rounded-[18px] border border-line bg-white p-5 text-[14.5px] text-muted">
          {t("productsEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-extrabold text-ink">
                    {p.name}
                  </div>
                  {p.price !== null && (
                    <div className="text-[14px] font-extrabold text-ff-primary">
                      {formatPrice(p)}
                    </div>
                  )}
                  {p.description && (
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
                      {p.description}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "flex h-7 flex-none items-center rounded-full px-2.5 text-[12px] font-bold",
                    p.active
                      ? "bg-ff-mint text-ff-primary-dark"
                      : "bg-surface text-muted",
                  )}
                >
                  {p.active ? t("productActive") : t("productInactive")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(p)}
                  aria-pressed={p.active}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center rounded-full text-[13.5px] font-bold",
                    p.active
                      ? "border-[1.5px] border-line bg-white text-ink-2 hover:bg-surface"
                      : "bg-ff-primary text-white hover:opacity-90",
                  )}
                >
                  {p.active ? t("productDeactivate") : t("productActivate")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="flex h-10 flex-none items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-4 text-[13.5px] font-bold text-alert hover:bg-surface"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("productDelete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
