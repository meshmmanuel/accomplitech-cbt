import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-gold text-navy-dark hover:bg-gold/90 border border-transparent",
  navy: "bg-navy text-exam-white hover:bg-navy/90 border border-transparent",
  ghost:
    "bg-transparent text-exam-muted border border-exam-border hover:bg-surface",
  danger:
    "bg-red-50 text-exam-red border border-red-200 hover:bg-red-100",
  success:
    "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100",
  purple:
    "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
};

export type ButtonVariant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "sm";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm",
          variants[variant],
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
