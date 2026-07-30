// KS-Data-Logo: Wortmarke mit Kosovo-Silhouette (Umriss aus Natural-Earth-Daten)
import { cn } from "./ui";

const KOSOVO_PATH =
  "M22.046,44.817L30.564,42.016L31.816,39.873L29.812,35.585L31.065,32.945L41.336,25.182L43.09,21.71L43.841,18.898L42.338,16.085L40.334,11.448L41.336,9.46L46.848,6.808L51.106,3.823L53.612,3.491L55.365,5.813L55.365,8.134L56.868,11.945L59.875,13.933L65.386,17.409L71.649,19.725L76.409,24.356L83.173,32.615L84.175,36.74L90.188,40.368L95.699,44.487L94.697,52.06L113.737,58.637L117.996,58.637L120,59.787L120,61.594L118.497,66.848L110.731,83.072L109.979,86.508L104.468,89.941L103.716,92.066L105.219,96.476L106.722,99.578L94.697,102.189L90.689,105.287L88.184,110.665L87.432,113.434L85.428,113.597L81.921,110.828L77.411,106.428L71.649,106.754L52.109,116.201L50.104,121.081L49.854,131.804L48.351,134.725L46.347,136.509L38.33,135.374L37.328,134.725L38.58,130.505L38.079,121.569L34.322,106.754L31.816,101.862L26.305,96.966L22.296,93.863L14.781,91.086L11.023,82.908L5.261,73.572L2.505,71.441L3.006,70.457L4.259,63.401L2.505,58.308L0,53.869L1.754,51.237L7.015,51.237L11.273,51.731L13.027,47.616Z";

export function KosovoSilhouette({
  className,
  fill = "#D9DEDC",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden>
      <path d={KOSOVO_PATH} fill={fill} />
    </svg>
  );
}

/** Logo-Lockup wie in der Vorlage: „KS data·" vor grauer Kosovo-Silhouette */
export function KsDataLogo({
  size = "lg",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const text =
    size === "lg" ? "text-[46px]" : size === "md" ? "text-[28px]" : "text-[22px]";
  const dot =
    size === "lg" ? "h-[11px] w-[11px]" : size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";
  const map =
    size === "lg"
      ? "h-[120px] w-[103px]"
      : size === "md"
        ? "h-[72px] w-[62px]"
        : "h-[52px] w-[45px]";
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <KosovoSilhouette
        className={cn(
          map,
          "absolute top-1/2 -translate-y-1/2 opacity-90",
          size === "sm" ? "-right-6" : "-right-10",
        )}
      />
      <span className="relative z-10 inline-flex items-baseline">
        <span className={cn(text, "font-extrabold tracking-[-0.04em] text-ink")}>
          KS
        </span>
        <span className={cn(text, "font-normal tracking-[-0.03em] text-ink")}>
          data
        </span>
        <span className={cn(dot, "ml-1 self-center rounded-full bg-primary")} />
      </span>
    </span>
  );
}
