"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api-client";
import { getServerUrl, setServerUrl, setStudentClientContext } from "@/lib/client-storage";
import type { StudentLoginResult } from "@/modules/auth/types";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Monitor } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [examCode, setExamCode] = useState("");
  const [serverUrl, setServerUrlState] = useState("");
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setServerUrlState(getServerUrl());
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (serverUrl.trim()) {
      setServerUrl(serverUrl.trim());
    }

    const result = await apiPost<StudentLoginResult>(
      "/api/auth/student/login",
      { admissionNumber, examCode },
    );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Login failed");
      return;
    }

    setStudentClientContext({
      admissionNumber: result.data.admissionNumber,
      sessionId: result.data.session.id,
    });

    router.push(`/session/${result.data.session.id}/instructions`);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-navy">
            <Monitor size={28} className="text-gold" />
          </div>
          <h2 className="m-0 mb-1.5 text-2xl font-extrabold text-exam-text">
            Student Login
          </h2>
          <p className="m-0 text-sm text-exam-muted">
            Enter your details to access your exam
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-exam-border bg-exam-white p-7 shadow-sm"
        >
          <Input
            label="Admission Number"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            placeholder="e.g. 2021/CS/001"
            autoComplete="off"
            required
          />
          <Input
            label="Exam Code"
            type="password"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            placeholder="Enter code from your invigilator"
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={() => setShowServerConfig((open) => !open)}
            className="mb-3 text-left text-xs font-medium text-navy hover:underline"
          >
            {showServerConfig ? "Hide server settings" : "Server settings (LAN)"}
          </button>
          {showServerConfig && (
            <Input
              label="Server URL"
              value={serverUrl}
              onChange={(e) => setServerUrlState(e.target.value)}
              placeholder="http://192.168.1.50:3000"
              autoComplete="off"
            />
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="mt-1 w-full justify-center"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Enter Exam"}
          </Button>
        </form>
      </div>
    </div>
  );
}
