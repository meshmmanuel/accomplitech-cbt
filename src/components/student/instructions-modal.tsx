"use client";

import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

interface InstructionsModalProps {
  title?: string;
  subtitle?: string;
  instructions: string;
  onBegin: () => void;
}

export function InstructionsModal({
  title = "Exam Instructions",
  subtitle = "CS101 Mid-Term Assessment · 90 minutes · 10 questions",
  instructions,
  onBegin,
}: InstructionsModalProps) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2.5">
        <ClipboardList size={24} className="text-navy" />
        <h3 className="text-lg font-extrabold text-exam-text">{title}</h3>
      </div>
      <div className="mb-2.5 rounded-[10px] border border-[#FDDEA0] bg-gold-light p-4.5">
        <p className="m-0 whitespace-pre-line text-[13px] leading-relaxed text-amber-800">
          {instructions}
        </p>
      </div>
      <p className="mb-4.5 text-xs text-exam-muted">{subtitle}</p>
      <Button variant="navy" className="w-full justify-center" onClick={onBegin}>
        I understand — Begin Exam
      </Button>
    </>
  );
}
