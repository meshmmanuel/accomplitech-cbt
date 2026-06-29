import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  bg?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Avatar({
  name,
  bg = "bg-navy",
  className,
  size = "sm",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-exam-white",
        size === "sm" ? "h-[30px] w-[30px] text-[10px]" : "h-9 w-9 text-xs",
        bg.startsWith("#") ? "" : bg,
        className,
      )}
      style={bg.startsWith("#") ? { backgroundColor: bg } : undefined}
    >
      {initials}
    </div>
  );
}
