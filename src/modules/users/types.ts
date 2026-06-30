import type { UserRole, UserStatus } from "@prisma/client";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  subjectIds: string[];
  subjectCodes: string[];
  createdAt: string;
}
