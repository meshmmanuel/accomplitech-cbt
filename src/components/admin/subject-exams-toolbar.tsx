"use client";

import { ExamFormModal } from "@/components/admin/exam-form-modal";
import { Button } from "@/components/ui/button";
import type { ExamDetail } from "@/modules/exams";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubjectExamsToolbarProps {
  subjectId: string;
}

export function SubjectExamsToolbar({ subjectId }: SubjectExamsToolbarProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  const handleSuccess = (exam: ExamDetail) => {
    router.refresh();
    router.push(`/admin/subjects/${subjectId}/exams/${exam.id}`);
  };

  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Exam
        </Button>
      </div>

      {showCreate && (
        <ExamFormModal
          subjectId={subjectId}
          onClose={() => setShowCreate(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
