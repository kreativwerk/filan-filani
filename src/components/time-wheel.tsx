"use client";

/* Cupertino-artiger Zeitwähler: Bottom-Sheet mit zwei Scroll-Rädern
   (Stunden 0–23, Minuten in 15er-Schritten), Snap aufs mittlere Feld. */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";

const ITEM_H = 44;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function Wheel({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const idx = Math.max(0, values.indexOf(selected));
    ref.current?.scrollTo({ top: idx * ITEM_H });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Öffnen zentrieren
  }, []);

  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.min(
        values.length - 1,
        Math.max(0, Math.round(el.scrollTop / ITEM_H)),
      );
      onSelect(values[idx]);
    }, 80);
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar h-[220px] flex-1 snap-y snap-mandatory overflow-y-scroll"
      style={{ paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}
    >
      {values.map((v) => (
        <div
          key={v}
          onClick={() => {
            onSelect(v);
            ref.current?.scrollTo({
              top: values.indexOf(v) * ITEM_H,
              behavior: "smooth",
            });
          }}
          className={cn(
            "flex snap-center items-center justify-center text-[22px] tabular-nums",
            v === selected
              ? "font-extrabold text-ink"
              : "font-medium text-muted",
          )}
          style={{ height: ITEM_H }}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

export function TimeWheelButton({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: string; // "08:00"
  onChange: (v: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [h, m] = value.split(":");
  const [hour, setHour] = useState(h ?? "08");
  const [minute, setMinute] = useState(
    MINUTES.includes(m) ? m : "00",
  );

  function openSheet() {
    const [ch, cm] = value.split(":");
    setHour(ch ?? "08");
    setMinute(MINUTES.includes(cm) ? cm : "00");
    setOpen(true);
  }

  function confirm() {
    onChange(`${hour}:${minute}`);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={openSheet}
        className="flex h-11 w-[86px] items-center justify-center rounded-[12px] border-[1.5px] border-line-strong bg-white text-[16px] font-bold tabular-nums text-ink disabled:opacity-40"
      >
        {value}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-[28px] bg-white p-5 pb-8 sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex">
              {/* Auswahl-Balken in der Mitte */}
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[14px] bg-surface"
                style={{ height: ITEM_H }}
              />
              <Wheel values={HOURS} selected={hour} onSelect={setHour} />
              <div className="z-10 flex items-center text-[22px] font-extrabold text-ink">
                :
              </div>
              <Wheel values={MINUTES} selected={minute} onSelect={setMinute} />
            </div>
            <button
              type="button"
              onClick={confirm}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary text-[16px] font-extrabold text-white hover:opacity-90"
            >
              {tc("ok")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
