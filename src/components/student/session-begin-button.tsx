"use client";

import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-client";
import type { SessionHubState } from "@/modules/student-exam";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SessionBeginButtonProps {
  sessionId: string;
  examCount: number;
}

export function SessionBeginButton({
  sessionId,
  examCount,
}: SessionBeginButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const begin = async () => {
    setLoading(true);
    setError("");

    const result = await apiPost<SessionHubState>(
      `/api/sessions/${sessionId}/begin`,
      {},
    );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Could not start session");
      return;
    }

    if (result.data.expired) {
      setError("Session time has expired");
      return;
    }

    router.push(`/session/${sessionId}/workspace`);
    router.refresh();
  };

  return (
    <>
      {error && (
        <p className="mb-3 text-center text-sm text-exam-red">{error}</p>
      )}
      <Button
        variant="navy"
        className="w-full justify-center"
        disabled={loading}
        onClick={begin}
      >
        {loading ? "Starting..." : examCount === 1 ? "Begin Exam" : "Begin Session"}
      </Button>
    </>
  );
}
