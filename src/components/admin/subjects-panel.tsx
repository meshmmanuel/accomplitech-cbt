"use client";

import { SubjectFormModal } from "@/components/admin/subject-form-modal";
import { Button } from "@/components/ui/button";
import type { SubjectListItem } from "@/modules/subjects";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubjectsPanelProps {
  subjects: SubjectListItem[];
  canManageSubjects?: boolean;
}

export function SubjectsPanel({
  subjects,
  canManageSubjects = true,
}: SubjectsPanelProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  const refresh = () => router.refresh();

  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        {canManageSubjects ? (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Subject
          </Button>
        ) : null}
      </div>

      {subjects.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-dashed border-exam-border bg-exam-white p-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
            <Plus size={22} className="text-exam-muted" />
          </div>
          <p className="mb-1 text-[15px] font-bold text-exam-text">
            No subjects yet
          </p>
          <p className="mb-4 max-w-sm text-sm text-exam-muted">
            {canManageSubjects
              ? "Create your first subject to start building exams and sessions."
              : "No subjects have been assigned to your account yet."}
          </p>
          {canManageSubjects ? (
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Add Subject
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/admin/subjects/${subject.id}`}
              className="cursor-pointer rounded-[13px] border border-exam-border bg-exam-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3.5 flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: subject.color }}
                >
                  <span
                    className="text-[11px] font-extrabold"
                    style={{ color: subject.dot }}
                  >
                    {subject.code}
                  </span>
                </div>
                <ChevronRight size={16} className="text-exam-muted" />
              </div>
              <div className="mb-1 text-[15px] font-bold text-exam-text">
                {subject.name}
              </div>
              <div className="mb-3 text-xs leading-relaxed text-exam-muted">
                {subject.description ?? "No description"}
              </div>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-exam-muted">
                {subject.examCount} exam{subject.examCount !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setShowCreate(true)}
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
      )}

      {showCreate && (
        <SubjectFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
