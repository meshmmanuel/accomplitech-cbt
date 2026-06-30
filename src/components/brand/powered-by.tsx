import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PoweredByProps {
  className?: string;
  onDark?: boolean;
}

export function PoweredBy({ className, onDark = false }: PoweredByProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center",
        className,
      )}
    >
      <p
        className={cn(
          "m-0 text-[11px] font-medium uppercase tracking-wide",
          onDark ? "text-[#7B90C4]" : "text-exam-muted",
        )}
      >
        Built &amp; powered by
      </p>
      <a
        href={BRAND.companyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-2 py-1 transition-opacity hover:opacity-80",
          onDark ? "text-exam-white" : "text-exam-text",
        )}
      >
        <Image
          src={BRAND.logoSrc}
          alt={BRAND.logoAlt}
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
        <span className="text-sm font-bold">{BRAND.companyName}</span>
      </a>
    </div>
  );
}
