import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, User } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "./logout-button";
import { Wordmark } from "./ui";

export async function PortalHeader({
  isAdmin = false,
  greetingName,
}: {
  isAdmin?: boolean;
  greetingName?: string;
}) {
  const t = await getTranslations("nav");
  const td = await getTranslations("dashboard");

  return (
    <header className="bg-background">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {/* Mobil: Begrüßung wie im Design; Desktop: Wortmarke + Links */}
        <div className="flex-1 min-w-0">
          <div className="sm:hidden leading-tight">
            <div className="text-[13.5px] font-medium text-muted">
              {td("greeting")}
            </div>
            <div className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              {greetingName || "KS data"}
            </div>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/dashboard">
              <Wordmark size="sm" />
            </Link>
            <nav className="flex items-center gap-5 text-[15px] font-bold text-ink-2">
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
        <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface text-ink-2">
          <User className="h-[22px] w-[22px]" />
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
