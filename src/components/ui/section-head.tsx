import { cn } from "@/lib/utils";

interface SectionHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHead({ children, className }: SectionHeadProps) {
  return (
    <div
      className={cn(
        "mb-2 text-[11px] font-bold uppercase tracking-wide text-exam-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
