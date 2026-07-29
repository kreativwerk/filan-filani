// Flaggen als Inline-SVG (die jugoslawische Flagge existiert nicht als Emoji;
// sie steht hier bewusst für Serbisch/Bosnisch/Kroatisch gemeinsam)
import type { Locale } from "@/i18n/config";

function FlagSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className="inline-block h-4 w-6 rounded-[2px] shadow-sm"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function Flag({ locale }: { locale: Locale }) {
  switch (locale) {
    case "sq":
      return (
        <FlagSvg>
          <rect width="24" height="16" fill="#e41e20" />
          <circle cx="12" cy="8" r="4" fill="#000" />
        </FlagSvg>
      );
    case "de":
      return (
        <FlagSvg>
          <rect width="24" height="5.33" y="0" fill="#000" />
          <rect width="24" height="5.33" y="5.33" fill="#dd0000" />
          <rect width="24" height="5.34" y="10.66" fill="#ffce00" />
        </FlagSvg>
      );
    case "en":
      return (
        <FlagSvg>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.6" />
          <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
          <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" />
        </FlagSvg>
      );
    case "sr":
      // Jugoslawische Flagge: blau-weiß-rot mit rotem Stern
      return (
        <FlagSvg>
          <rect width="24" height="5.33" y="0" fill="#003893" />
          <rect width="24" height="5.33" y="5.33" fill="#fff" />
          <rect width="24" height="5.34" y="10.66" fill="#de0000" />
          <path
            d="M12 4.2l0.88 2.7h2.84l-2.3 1.67 0.88 2.7L12 9.6l-2.3 1.67 0.88-2.7-2.3-1.67h2.84z"
            fill="#fcd116"
            stroke="#de0000"
            strokeWidth="0.4"
          />
        </FlagSvg>
      );
  }
}
