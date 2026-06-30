"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiPatch, apiPost } from "@/lib/api-client";
import { ROLE_LABELS } from "@/lib/admin-roles";
import type { SubjectListItem } from "@/modules/subjects";
import type { UserListItem } from "@/modules/users";
import { AlertCircle } from "lucide-react";

interface UserFormModalProps {
  user?: UserListItem | null;
  subjects: SubjectListItem[];
  availableRoles: UserRole[];
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormModal({
  user,
  subjects,
  availableRoles,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "LECTURER");
  const [subjectIds, setSubjectIds] = useState<string[]>(user?.subjectIds ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRole(user?.role ?? "LECTURER");
    setSubjectIds(user?.subjectIds ?? []);
    setError("");
  }, [user]);

  const toggleSubject = (subjectId: string) => {
    setSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (role === "LECTURER" && subjectIds.length === 0) {
      setError("Select at least one subject for lecturers");
      setLoading(false);
      return;
    }

    const result =
      isEdit && user
        ? await apiPatch<UserListItem>(`/api/users/${user.id}`, {
            name,
            role,
            subjectIds: role === "LECTURER" ? subjectIds : [],
            ...(password ? { password } : {}),
          })
        : await apiPost<UserListItem>("/api/users", {
            name,
            email,
            password,
            role,
            subjectIds: role === "LECTURER" ? subjectIds : [],
          });

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
      title={isEdit ? "Edit User" : "Add User"}
      onClose={onClose}
      wide
      className="max-w-[560px]"
    >
      <form onSubmit={submit}>
        <Input
          label="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isEdit}
          required={!isEdit}
        />
        <Input
          label={isEdit ? "New password (optional)" : "Password"}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required={!isEdit}
          minLength={6}
        />

        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Role
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-lg border-[1.5px] border-exam-border bg-exam-white px-3.5 py-2.5 text-[13px] text-exam-text outline-none focus:border-navy"
          >
            {availableRoles.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        {role === "LECTURER" ? (
          <div className="mb-3.5">
            <label className="mb-2 block text-xs font-semibold text-exam-text">
              Assigned subjects
            </label>
            <div className="grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-exam-border p-3">
              {subjects.map((subject) => {
                const checked = subjectIds.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-exam-text"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubject(subject.id)}
                    />
                    <span>
                      {subject.code} — {subject.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-exam-red">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
