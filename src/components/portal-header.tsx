import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Bell, ShieldCheck, User } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { KsDataLogo } from "./ks-data-logo";

export async function PortalHeader({
  isAdmin = false,
}: {
  isAdmin?: boolean;
  greetingName?: string;
}) {
  const t = await getTranslations("nav");

  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-1.5 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="py-1 pr-6">
              <KsDataLogo size="sm" />
            </Link>
            <nav className="hidden items-center gap-5 text-[15px] font-bold text-ink-2 sm:flex">
              <Link href="/dashboard" className="hover:text-primary">
                {t("dashboard")}
              </Link>
              <Link href="/businesses" className="hover:text-primary">
                {t("entries")}
              </Link>
              <Link
                href="/businesses/new"
                className="rounded-full bg-primary px-4 py-2 text-white hover:bg-primary-dark"
              >
                {t("newEntry")}
              </Link>
            </nav>
          </div>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            aria-label={t("admin")}
            className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primary-light text-primary-dark"
          >
            <ShieldCheck className="h-[22px] w-[22px]" />
          </Link>
        )}
        <LanguageSwitcher />
        <Link
          href="/businesses"
          aria-label={t("entries")}
          className="grid h-11 w-11 flex-none place-items-center rounded-full text-ink hover:bg-surface"
        >
          <Bell className="h-[23px] w-[23px]" />
        </Link>
        <Link
          href="/profile"
          aria-label="Profil"
          className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface text-ink-2 hover:bg-line"
        >
          <User className="h-[22px] w-[22px]" />
        </Link>
      </div>
    </header>
  );
}
