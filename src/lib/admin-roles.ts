import type { UserRole } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  EXAM_OFFICER: "Exam Officer",
  LECTURER: "Lecturer",
  INVIGILATOR: "Invigilator",
  VIEWER: "Viewer",
};

const GRADER_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
  "LECTURER",
]);

const USER_MANAGER_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
]);

const SUBJECT_MANAGER_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
]);

const EXAM_CONTENT_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
  "LECTURER",
]);

const SESSION_MANAGER_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
]);

const MONITOR_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
  "LECTURER",
  "INVIGILATOR",
]);

const RESULTS_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
  "LECTURER",
  "VIEWER",
]);

const SETTINGS_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "EXAM_OFFICER",
]);

export function canGradeTheory(role: UserRole) {
  return GRADER_ROLES.has(role);
}

export function canManageUsers(role: UserRole) {
  return USER_MANAGER_ROLES.has(role);
}

export function canManageSubjects(role: UserRole) {
  return SUBJECT_MANAGER_ROLES.has(role);
}

export function canManageExamContent(role: UserRole) {
  return EXAM_CONTENT_ROLES.has(role);
}

export function canManageSessions(role: UserRole) {
  return SESSION_MANAGER_ROLES.has(role);
}

export function canAccessMonitor(role: UserRole) {
  return MONITOR_ROLES.has(role);
}

export function canAccessResults(role: UserRole) {
  return RESULTS_ROLES.has(role);
}

export function canAccessSettings(role: UserRole) {
  return SETTINGS_ROLES.has(role);
}

export function canAccessReports(role: UserRole) {
  return role !== "INVIGILATOR";
}

export const ASSIGNABLE_ROLES: UserRole[] = [
  "EXAM_OFFICER",
  "LECTURER",
  "INVIGILATOR",
  "VIEWER",
];
