import { useTranslations } from "next-intl";
import type { BusinessStatus } from "@/lib/types";
import { cn } from "./ui";

const styles: Record<BusinessStatus, string> = {
  draft: "bg-surface text-muted",
  pending: "bg-[#FBF0D6] text-[#6B4C07]",
  approved: "bg-[#DCEDEA] text-[#0B443E]",
  rejected: "bg-[#FFE4DC] text-[#A3241A]",
};

export function StatusBadge({ status }: { status: BusinessStatus }) {
  const t = useTranslations("status");
  return (
    <span
      className={cn(
        "inline-flex rounded-[9px] px-2.5 py-1 text-[11.5px] font-extrabold",
        styles[status],
      )}
    >
      {t(status)}
    </span>
  );
}
