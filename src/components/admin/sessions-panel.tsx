"use client";

import { SessionCard } from "@/components/admin/session-card";
import { SessionFormModal } from "@/components/admin/session-form-modal";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiDelete } from "@/lib/api-client";
import type { ExamPickerItem, SessionListItem } from "@/modules/sessions";
import { AlertCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SessionsPanelProps {
  sessions: SessionListItem[];
  exams: ExamPickerItem[];
}

export function SessionsPanel({ sessions, exams }: SessionsPanelProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionListItem | null>(
    null,
  );
  const [deletingSession, setDeletingSession] =
    useState<SessionListItem | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const refresh = () => router.refresh();

  const confirmDelete = async () => {
    if (!deletingSession) return;

    setError("");
    setDeleting(true);

    const result = await apiDelete<{ deleted: boolean }>(
      `/api/sessions/${deletingSession.id}`,
    );

    setDeleting(false);

    if (result.error) {
      setError(result.error ?? result.message ?? "Delete failed");
      return;
    }

    setDeletingSession(null);
    refresh();
  };

  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        <Button
          variant="primary"
          onClick={() => {
            setEditingSession(null);
            setShowCreate(true);
          }}
        >
          <Plus size={14} /> New Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-dashed border-exam-border bg-exam-white p-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
            <Plus size={22} className="text-exam-muted" />
          </div>
          <p className="mb-1 text-[15px] font-bold text-exam-text">
            No sessions yet
          </p>
          <p className="mb-4 max-w-sm text-sm text-exam-muted">
            Create a session, link exams, and share the exam code with students.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreate(true)}
            disabled={exams.length === 0}
          >
            <Plus size={14} /> Create Session
          </Button>
          {exams.length === 0 && (
            <p className="mt-3 text-xs text-exam-muted">
              Create exams under Subjects &amp; Exams first.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={(session) => {
                setShowCreate(false);
                setEditingSession(session);
              }}
              onDelete={setDeletingSession}
            />
          ))}
        </div>
      )}

      {(showCreate || editingSession) && (
        <SessionFormModal
          session={editingSession}
          exams={exams}
          onClose={() => {
            setShowCreate(false);
            setEditingSession(null);
          }}
          onSuccess={() => {
            setShowCreate(false);
            setEditingSession(null);
            refresh();
          }}
        />
      )}

      {deletingSession && (
        <Modal
          title="Delete Session?"
          onClose={() => {
            setDeletingSession(null);
            setError("");
          }}
        >
          <p className="mb-4 text-sm leading-relaxed text-exam-muted">
            Are you sure you want to delete{" "}
            <strong className="text-exam-text">{deletingSession.name}</strong>?
            Students will no longer be able to use exam code{" "}
            <strong className="text-exam-text">{deletingSession.examCode}</strong>.
          </p>
          {deletingSession.attemptCount > 0 && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[13px] text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              This session has {deletingSession.attemptCount} student attempt
              {deletingSession.attemptCount !== 1 ? "s" : ""} and cannot be
              deleted.
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeletingSession(null);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting || deletingSession.attemptCount > 0}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Delete Session"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
