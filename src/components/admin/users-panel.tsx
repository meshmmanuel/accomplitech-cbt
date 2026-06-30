"use client";

import { useEffect, useState } from "react";
import { FormEvent } from "react";
import { AlertCircle, Pencil, Plus, UserX } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { UserFormModal } from "@/components/admin/user-form-modal";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  canManageUsers,
} from "@/lib/admin-roles";
import type { AdminAuthUser } from "@/modules/auth/types";
import type { SubjectListItem } from "@/modules/subjects";
import type { UserListItem } from "@/modules/users";

interface UsersPanelProps {
  initialUsers: UserListItem[];
  subjects: SubjectListItem[];
  currentAdmin: AdminAuthUser;
}

function roleBadgeStatus(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "both";
    case "EXAM_OFFICER":
      return "open";
    case "LECTURER":
      return "theory";
    case "INVIGILATOR":
      return "upcoming";
    default:
      return "draft";
  }
}

export function UsersPanel({
  initialUsers,
  subjects,
  currentAdmin,
}: UsersPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [error, setError] = useState("");
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const reloadUsers = async () => {
    const result = await apiGet<UserListItem[]>("/api/users");
    if (result.data) {
      setUsers(result.data);
    }
  };

  const toggleUserStatus = async (user: UserListItem) => {
    setError("");
    setActionUserId(user.id);

    const result = await apiPatch<UserListItem>(`/api/users/${user.id}`, {
      status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });

    setActionUserId(null);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to update user");
      return;
    }

    await reloadUsers();
  };

  const availableRoles =
    currentAdmin.role === "SUPER_ADMIN"
      ? (["SUPER_ADMIN", ...ASSIGNABLE_ROLES] as UserRole[])
      : ASSIGNABLE_ROLES;

  if (!canManageUsers(currentAdmin.role)) {
    return (
      <div className="rounded-xl border border-exam-border bg-exam-white p-6 text-sm text-exam-muted">
        You do not have permission to manage users.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4.5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-exam-text">Staff Accounts</h3>
          <p className="mt-1 text-sm text-exam-muted">
            Create lecturers, exam officers, invigilators, and viewers.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-exam-red">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {users.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-exam-border bg-exam-white p-8 text-center">
          <p className="mb-1 text-[15px] font-bold text-exam-text">No staff yet</p>
          <p className="mb-4 text-sm text-exam-muted">
            Add lecturers and exam officers to share the workload.
          </p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add User
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse">
              <thead>
                <tr className="bg-surface">
                  {["User", "Role", "Subjects", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-exam-border px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-exam-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-exam-border">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={user.name} />
                        <div>
                          <div className="text-[13px] font-semibold text-exam-text">
                            {user.name}
                            {user.id === currentAdmin.id ? (
                              <span className="ml-2 text-[11px] font-medium text-exam-muted">
                                (you)
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-exam-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <Badge status={roleBadgeStatus(user.role)} />
                      <span className="ml-2 text-xs font-medium text-exam-text">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-xs text-exam-muted">
                      {user.role === "LECTURER"
                        ? user.subjectCodes.join(", ") || "—"
                        : "All subjects"}
                    </td>
                    <td className="px-3.5 py-3">
                      <Badge
                        status={user.status === "ACTIVE" ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil size={12} /> Edit
                        </Button>
                        {user.id !== currentAdmin.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionUserId === user.id}
                            onClick={() => void toggleUserStatus(user)}
                          >
                            <UserX size={12} />
                            {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate ? (
        <UserFormModal
          subjects={subjects}
          availableRoles={availableRoles}
          onClose={() => setShowCreate(false)}
          onSuccess={reloadUsers}
        />
      ) : null}

      {editingUser ? (
        <UserFormModal
          user={editingUser}
          subjects={subjects}
          availableRoles={availableRoles}
          onClose={() => setEditingUser(null)}
          onSuccess={reloadUsers}
        />
      ) : null}
    </>
  );
}
