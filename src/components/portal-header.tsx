import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "./logout-button";

export async function PortalHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-petrol/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-petrol">KS Data</span>
          <span className="hidden text-xs text-petrol/50 sm:inline">
            by Filan Filani
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-petrol/80">
          <Link href="/dashboard" className="hover:text-petrol">
            {t("dashboard")}
          </Link>
          <Link href="/businesses" className="hidden hover:text-petrol sm:inline">
            {t("myEntries")}
          </Link>
          <Link
            href="/businesses/new"
            className="rounded-full bg-lime px-3 py-1.5 font-semibold text-petrol-dark hover:bg-lime-dark"
          >
            {t("newEntry")}
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-petrol">
              {t("admin")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
