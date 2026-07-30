// Runde Original-Flaggen (flag-icons/circle-flags, MIT) aus public/flags/.
// "sr" zeigt bewusst die jugoslawische Flagge — steht für SR/BS/HR gemeinsam.
import Image from "next/image";
import type { Locale } from "@/i18n/config";

const flagFiles: Record<Locale, string> = {
  sq: "/flags/al.svg",
  de: "/flags/de.svg",
  en: "/flags/gb.svg",
  sr: "/flags/yu.svg",
};

export function Flag({
  locale,
  className = "h-5 w-5",
}: {
  locale: Locale;
  className?: string;
}) {
  return (
    <Image
      src={flagFiles[locale]}
      alt=""
      width={28}
      height={28}
      className={`inline-block flex-none rounded-full object-cover shadow-sm ${className}`}
      aria-hidden
    />
  );
}
