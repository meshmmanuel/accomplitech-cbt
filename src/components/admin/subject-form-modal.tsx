"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiPatch, apiPost } from "@/lib/api-client";
import type { SubjectListItem } from "@/modules/subjects";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface SubjectFormModalProps {
  subject?: SubjectListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubjectFormModal({
  subject,
  onClose,
  onSuccess,
}: SubjectFormModalProps) {
  const isEdit = Boolean(subject);
  const [code, setCode] = useState(subject?.code ?? "");
  const [name, setName] = useState(subject?.name ?? "");
  const [description, setDescription] = useState(subject?.description ?? "");
  const [department, setDepartment] = useState(subject?.department ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(subject?.code ?? "");
    setName(subject?.name ?? "");
    setDescription(subject?.description ?? "");
    setDepartment(subject?.department ?? "");
    setError("");
  }, [subject]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      code,
      name,
      description,
      department,
    };

    const result = isEdit && subject
      ? await apiPatch<SubjectListItem>(`/api/subjects/${subject.id}`, payload)
      : await apiPost<SubjectListItem>("/api/subjects", payload);

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Save failed");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Subject" : "New Subject"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Input
          label="Subject Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CS101"
          required
        />
        <Input
          label="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Introduction to Computer Science"
          required
        />
        <Input
          label="Department (optional)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Computer Science"
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the subject"
          rows={3}
        />
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Subject"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
