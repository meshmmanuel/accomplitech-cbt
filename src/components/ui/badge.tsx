import { cn } from "@/lib/utils";

const badgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-800", label: "Active" },
  idle: { bg: "bg-amber-50", text: "text-amber-800", label: "Idle" },
  submitted: { bg: "bg-blue-50", text: "text-blue-800", label: "Submitted" },
  offline: { bg: "bg-red-50", text: "text-red-800", label: "Offline" },
  disconnected: { bg: "bg-red-50", text: "text-red-800", label: "Disconnected" },
  upcoming: { bg: "bg-blue-50", text: "text-blue-800", label: "Upcoming" },
  completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
  open: { bg: "bg-emerald-50", text: "text-emerald-800", label: "Open" },
  obj: { bg: "bg-sky-50", text: "text-sky-800", label: "Objective" },
  theory: { bg: "bg-purple-50", text: "text-purple-800", label: "Theory" },
  both: { bg: "bg-emerald-50", text: "text-emerald-800", label: "Obj + Theory" },
  draft: { bg: "bg-gray-100", text: "text-gray-500", label: "Draft" },
  inactive: { bg: "bg-red-50", text: "text-red-800", label: "Inactive" },
  pending: { bg: "bg-amber-50", text: "text-amber-800", label: "Pending" },
  graded: { bg: "bg-emerald-50", text: "text-emerald-800", label: "Graded" },
};

export type BadgeStatus = keyof typeof badgeStyles;

interface BadgeProps {
  status: BadgeStatus | string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const config = badgeStyles[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        config.bg,
        config.text,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
