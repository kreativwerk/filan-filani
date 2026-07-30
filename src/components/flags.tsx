// Runde Original-Flaggen (circle-flags, MIT-Lizenz) aus public/flags/.
// "sr" zeigt bewusst die jugoslawische Flagge — steht für SR/BS/HR gemeinsam.
import Image from "next/image";
import type { Locale } from "@/i18n/config";

const flagFiles: Record<Locale, string> = {
  sq: "/flags/al.svg",
  de: "/flags/de.svg",
  en: "/flags/gb.svg",
  sr: "/flags/yu.svg",
};

export function Flag({ locale }: { locale: Locale }) {
  return (
    <Image
      src={flagFiles[locale]}
      alt=""
      width={20}
      height={20}
      className="inline-block h-5 w-5 flex-none rounded-full shadow-sm"
      aria-hidden
    />
  );
}
