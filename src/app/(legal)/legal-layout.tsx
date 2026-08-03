import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FFLogo } from "@/components/ff-logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export type LegalSection = { h: string; p: string[] };

/** Gemeinsames Gerüst der Rechtsseiten (Kushtet, Privatësia) */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="flex flex-1 flex-col bg-surface">
      <header className="flex items-center gap-2 bg-white px-3 py-3">
        <Link
          href="/app"
          aria-label="Filan Filani"
          className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <FFLogo className="h-8 w-8" />
        <h1 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink">
          {title}
        </h1>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 py-6">
        <p className="text-[13px] text-faint">{updated}</p>
        <div className="mt-4 flex flex-col gap-5">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                {s.h}
              </h2>
              {s.p.map((para, j) => (
                <p
                  key={j}
                  className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2"
                >
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
