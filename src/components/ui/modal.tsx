"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}

export function Modal({ title, onClose, children, wide, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-dark/65 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          "max-h-[88vh] w-full overflow-y-auto rounded-[18px] bg-exam-white p-7 shadow-2xl",
          wide ? "max-w-[640px]" : "max-w-[480px]",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-5.5 flex items-center justify-between">
          <h3
            id="modal-title"
            className="text-lg font-extrabold text-exam-text"
          >
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="border-0 p-1 text-exam-muted hover:bg-transparent"
            aria-label="Close modal"
          >
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
