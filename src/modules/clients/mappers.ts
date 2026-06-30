import type { ClientActivity } from "@prisma/client";
import type { ClientPresence, MonitorBadgeStatus } from "@/modules/clients/types";

export function activityFromPathname(pathname: string): ClientActivity {
  if (pathname.startsWith("/exam/success")) return "SUBMITTED";
  if (pathname.includes("/instructions")) return "INSTRUCTIONS";
  if (pathname.includes("/workspace")) return "IN_EXAM";
  return "IDLE";
}

export function mapActivityToMonitorStatus(
  activity: ClientActivity,
): MonitorBadgeStatus {
  switch (activity) {
    case "IN_EXAM":
      return "active";
    case "SUBMITTED":
      return "submitted";
    case "INSTRUCTIONS":
    case "IDLE":
    default:
      return "idle";
  }
}

export function mapPresenceToMonitorStatus(
  presence: ClientPresence,
  activity: ClientActivity,
): MonitorBadgeStatus {
  if (presence === "offline") return "offline";
  if (presence === "disconnected") return "disconnected";
  return mapActivityToMonitorStatus(activity);
}

/** Distinct label for admin monitor — avoids `client-m` collisions from `.slice(0, 8)`. */
export function formatWorkstationLabel(clientId: string): string {
  if (clientId.startsWith("client-")) {
    const randomSuffix = clientId.slice("client-".length).split("-").pop();
    if (randomSuffix && randomSuffix.length >= 4) {
      return randomSuffix.toUpperCase();
    }
  }

  return clientId.replace(/-/g, "").slice(-8).toUpperCase();
}
