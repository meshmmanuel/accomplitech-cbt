"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiPatch } from "@/lib/api-client";
import type { SessionExamSummary, SessionListItem } from "@/modules/sessions";
import { useState } from "react";

interface SessionExamReleaseToggleProps {
  sessionId: string;
  exam: SessionExamSummary;
  onUpdated: (session: SessionListItem) => void;
}

export function SessionExamReleaseToggle({
  sessionId,
  exam,
  onUpdated,
}: SessionExamReleaseToggleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setLoading(true);
    setError("");

    const result = await apiPatch<SessionListItem>(
      `/api/sessions/${sessionId}/exams/${exam.id}/release`,
      { isReleased: !exam.isReleased },
    );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Update failed");
      return;
    }

    onUpdated(result.data);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Badge status={exam.isReleased ? "open" : "draft"} />
        <Button
          variant={exam.isReleased ? "ghost" : "primary"}
          size="sm"
          disabled={loading}
          onClick={() => void toggle()}
        >
          {loading ? "..." : exam.isReleased ? "Hold back" : "Release"}
        </Button>
      </div>
      {error ? <span className="text-[10px] text-exam-red">{error}</span> : null}
    </div>
  );
}
