// Design-QA-Vorschau: rendert das Dashboard mit den Demo-Daten aus dem
// KS-Data-Design (design/ksdata-runner-app.html, Screen 3b) — ohne Supabase.
import { Bell, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/bottom-nav";
import {
  DashboardView,
  type DashboardData,
} from "@/components/dashboard-view";

const demo: DashboardData = {
  earnings: 105.5,
  totalCount: 221,
  todayCount: 14,
  corrections: [
    { id: "1", name: "Floktar Berati", note: "Numri i telefonit mungon", icon: "phone" },
    { id: "2", name: "Restorant Djema", note: "Duhet një foto e re", icon: "camera" },
    { id: "3", name: "Kafene Lura", note: "Adresa është e gabuar", icon: "map-pin" },
  ],
  categories: [
    ["Artizan / Ustai", 42],
    ["Kafene", 31],
    ["Restorant", 28],
  ],
  recent: [
    { id: "1", name: "Floktar Berati", city: "Prishtinë", status: "approved" },
    { id: "2", name: "Restorant Djema", city: "Prizren", status: "pending" },
  ],
};

export default async function PreviewPage() {
  const td = await getTranslations("dashboard");

  return (
    <>
      <header className="bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13.5px] font-medium text-muted">
              {td("greeting")}
            </div>
            <div className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              Albert Dobra
            </div>
          </div>
          <div className="relative grid h-11 w-11 flex-none place-items-center rounded-full text-ink">
            <Bell className="h-[23px] w-[23px]" />
            <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-alert px-1 text-xs font-extrabold text-white">
              3
            </span>
          </div>
          <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface text-ink-2">
            <User className="h-[23px] w-[23px]" />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 bg-surface pb-28 sm:pb-10">
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <DashboardView data={demo} />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
