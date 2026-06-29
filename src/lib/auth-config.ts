const DEFAULT_JWT_SECRET = "dev-only-change-in-production-examlink-cbt";

export const AUTH_COOKIE = {
  adminAccess: "examlink_admin_access",
  adminRefresh: "examlink_admin_refresh",
  studentAccess: "examlink_student_access",
} as const;

export const AUTH_TTL = {
  adminAccessSeconds: 60 * 15,
  adminRefreshSeconds: 60 * 60 * 24 * 7,
  studentAccessSeconds: 60 * 60 * 4,
} as const;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    secret === DEFAULT_JWT_SECRET
  ) {
    throw new Error("JWT_SECRET must be set in production");
  }
  return new TextEncoder().encode(secret);
}
