import { UsersPanel } from "@/components/admin/users-panel";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { canManageUsers } from "@/lib/admin-roles";
import { subjectService } from "@/services/subject.service";
import { userService } from "@/services/user.service";

export default async function AdminSettingsPage() {
  const admin = await getAdminSessionOrRedirect();
  const subjects = canManageUsers(admin.role)
    ? await subjectService.listAllForInstitution(admin)
    : await subjectService.listForAdmin(admin);
  const users = canManageUsers(admin.role)
    ? await userService.listForInstitution(admin.institutionId)
    : [];

  return (
    <div className="max-w-[920px]">
      <UsersPanel
        initialUsers={users}
        subjects={subjects}
        currentAdmin={admin}
      />
    </div>
  );
}
