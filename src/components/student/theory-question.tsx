import { ClipboardList } from "lucide-react";

export function TheoryQuestion() {
  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-exam-amber bg-amber-50 p-6 text-center">
      <ClipboardList size={34} className="mx-auto mb-2.5 text-exam-amber" />
      <div className="mb-1 text-sm font-bold text-amber-800">Answer on Paper</div>
      <div className="text-[13px] leading-relaxed text-amber-700">
        Write your response in the answer booklet provided. This question is
        automatically marked as seen.
      </div>
    </div>
  );
}
