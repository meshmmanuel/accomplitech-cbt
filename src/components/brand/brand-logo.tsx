import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  nameClassName?: string;
  className?: string;
  onDark?: boolean;
}

const sizes = {
  sm: { box: "h-8 w-8", image: 32, name: "text-sm" },
  md: { box: "h-[60px] w-[60px]", image: 60, name: "text-2xl" },
  lg: { box: "h-20 w-20", image: 80, name: "text-4xl" },
} as const;

export function BrandLogo({
  size = "sm",
  showName = false,
  nameClassName,
  className,
  onDark = false,
}: BrandLogoProps) {
  const config = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-exam-white",
          config.box,
        )}
      >
        <Image
          src={BRAND.logoSrc}
          alt={BRAND.logoAlt}
          width={config.image}
          height={config.image}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </div>
      {showName && (
        <span
          className={cn(
            "font-extrabold leading-tight",
            config.name,
            onDark ? "text-exam-white" : "text-exam-text",
            nameClassName,
          )}
        >
          {BRAND.productShort}{" "}
          <span className={onDark ? "text-gold" : "text-navy"}>CBT</span>
        </span>
      )}
    </div>
  );
}
