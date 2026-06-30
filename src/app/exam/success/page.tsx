import { ExamSuccessClient } from "@/components/student/exam-success-client";
import { Suspense } from "react";

export default function ExamSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <p className="text-sm text-exam-muted">Loading results...</p>
        </div>
      }
    >
      <ExamSuccessClient />
    </Suspense>
  );
}
