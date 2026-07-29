import { useTranslations } from "next-intl";
import type { BusinessStatus } from "@/lib/types";
import { cn } from "./ui";

const styles: Record<BusinessStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: BusinessStatus }) {
  const t = useTranslations("status");
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[status],
      )}
    >
      {t(status)}
    </span>
  );
}
