import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[18px] border border-line bg-white p-5", className)}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger" | "soft";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-6 text-[16px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
        variant === "outline" &&
          "border-[1.5px] border-primary bg-white text-primary-dark hover:bg-primary-light/40",
        variant === "ghost" &&
          "border-[1.5px] border-line-strong bg-white text-ink hover:bg-surface",
        variant === "soft" &&
          "bg-primary-light text-primary-dark hover:bg-primary-light/70",
        variant === "danger" && "bg-alert text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-[50px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-[50px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink focus:border-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-bold text-ink-2", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/** Abschnitts-Label: 11px, uppercase, letter-spacing — wie im Design */
export function SectionLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.08em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

/** Pflichtfeld-Marker: Outline-Pill in Primärblau */
export function RequiredPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border-[1.5px] border-primary px-2.5 py-1 text-[11.5px] font-extrabold text-primary-dark">
      {children}
    </span>
  );
}

/** KS-Data-Wortmarke: „KS" fett, „data" leicht, Punkt in Primärblau */
export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "text-[46px]"
      : size === "md"
        ? "text-[28px]"
        : "text-[20px]";
  const dot =
    size === "lg" ? "h-[11px] w-[11px]" : size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";
  return (
    <span className="inline-flex items-baseline">
      <span className={cn(cls, "font-extrabold tracking-[-0.04em] text-ink")}>
        KS
      </span>
      <span className={cn(cls, "font-normal tracking-[-0.03em] text-ink")}>
        data
      </span>
      <span className={cn(dot, "ml-1 self-center rounded-full bg-primary")} />
    </span>
  );
}
