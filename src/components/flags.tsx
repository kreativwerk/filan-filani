// Runde Flaggen als Inline-SVG.
// "sr" zeigt bewusst die jugoslawische Flagge (steht für SR/BS/HR gemeinsam).
import { useId } from "react";
import type { Locale } from "@/i18n/config";

function RoundFlag({ children }: { children: React.ReactNode }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className="inline-block h-5 w-5 flex-none rounded-full shadow-sm"
      aria-hidden
    >
      <defs>
        <clipPath id={id}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

/* Stilisierter Doppeladler für die albanische Flagge */
function Eagle() {
  return (
    <g fill="#000" transform="translate(16 16.5)">
      {/* Körper */}
      <rect x="-1.3" y="-6" width="2.6" height="9" rx="1" />
      {/* Köpfe mit Schnäbeln nach außen */}
      <circle cx="-2.2" cy="-6.5" r="1.7" />
      <circle cx="2.2" cy="-6.5" r="1.7" />
      <path d="M-3.6 -6.9 L-5.4 -6.2 L-3.6 -5.7 Z" />
      <path d="M3.6 -6.9 L5.4 -6.2 L3.6 -5.7 Z" />
      {/* Flügel: je drei gefächerte Schwingen */}
      <g>
        <path d="M-1.5 -4.6 L-9.5 -6.8 L-9.0 -5.0 L-1.5 -3.0 Z" />
        <path d="M-1.5 -2.4 L-9.8 -3.4 L-9.2 -1.5 L-1.5 -0.8 Z" />
        <path d="M-1.5 -0.2 L-9.4 0.4 L-8.6 2.2 L-1.5 1.4 Z" />
      </g>
      <g>
        <path d="M1.5 -4.6 L9.5 -6.8 L9.0 -5.0 L1.5 -3.0 Z" />
        <path d="M1.5 -2.4 L9.8 -3.4 L9.2 -1.5 L1.5 -0.8 Z" />
        <path d="M1.5 -0.2 L9.4 0.4 L8.6 2.2 L1.5 1.4 Z" />
      </g>
      {/* Schwanzfedern */}
      <path d="M-1.2 3 L-2.6 6.4 L-0.9 5.6 L0 6.8 L0.9 5.6 L2.6 6.4 L1.2 3 Z" />
    </g>
  );
}

export function Flag({ locale }: { locale: Locale }) {
  switch (locale) {
    case "sq":
      return (
        <RoundFlag>
          <rect width="32" height="32" fill="#e41e20" />
          <Eagle />
        </RoundFlag>
      );
    case "de":
      return (
        <RoundFlag>
          <rect width="32" height="10.7" y="0" fill="#000" />
          <rect width="32" height="10.7" y="10.7" fill="#dd0000" />
          <rect width="32" height="10.6" y="21.4" fill="#ffce00" />
        </RoundFlag>
      );
    case "en":
      return (
        <RoundFlag>
          <rect width="32" height="32" fill="#012169" />
          <path d="M0 0l32 32M32 0L0 32" stroke="#fff" strokeWidth="5" />
          <path d="M0 0l32 32M32 0L0 32" stroke="#c8102e" strokeWidth="2.4" />
          <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="8" />
          <path d="M16 0v32M0 16h32" stroke="#c8102e" strokeWidth="4.8" />
        </RoundFlag>
      );
    case "sr":
      // Jugoslawische Flagge: blau-weiß-rot, roter Stern mit gelbem Rand
      return (
        <RoundFlag>
          <rect width="32" height="10.7" y="0" fill="#003893" />
          <rect width="32" height="10.7" y="10.7" fill="#fff" />
          <rect width="32" height="10.6" y="21.4" fill="#de0000" />
          <path
            d="M16 9.2l1.62 4.98h5.24l-4.24 3.08 1.62 4.98L16 19.16l-4.24 3.08 1.62-4.98-4.24-3.08h5.24z"
            fill="#de0000"
            stroke="#fcd116"
            strokeWidth="1.1"
          />
        </RoundFlag>
      );
  }
}
