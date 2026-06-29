import { Button } from "@/components/ui/button";
import { subjects } from "@/data/mock/subjects";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminSubjectsPage() {
  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        <Button variant="primary">
          <Plus size={16} /> New Subject
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/admin/subjects/${s.id}`}
            className="cursor-pointer rounded-[13px] border border-exam-border bg-exam-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="mb-3.5 flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.color }}
              >
                <span
                  className="text-[11px] font-extrabold"
                  style={{ color: s.dot }}
                >
                  {s.code}
                </span>
              </div>
              <ChevronRight size={16} className="text-exam-muted" />
            </div>
            <div className="mb-1 text-[15px] font-bold text-exam-text">
              {s.name}
            </div>
            <div className="mb-3 text-xs leading-relaxed text-exam-muted">
              {s.desc}
            </div>
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-exam-muted">
              {s.examCount} exam{s.examCount !== 1 ? "s" : ""}
            </span>
          </Link>
        ))}

        <button
          type="button"
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-[13px] border-2 border-dashed border-exam-border p-5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface">
            <Plus size={20} className="text-exam-muted" />
          </div>
          <span className="text-[13px] font-semibold text-exam-muted">
            Add Subject
          </span>
        </button>
      </div>
    </>
  );
}
