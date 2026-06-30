import type { SessionHubState } from "@/modules/student-exam";

/** Wall-clock time remaining from session start + duration (server-owned values). */
export function computeTimeRemainingSeconds(hub: Pick<
  SessionHubState,
  "startedAt" | "durationMinutes" | "expired"
>): number {
  if (hub.expired) return 0;

  const endsAt =
    new Date(hub.startedAt).getTime() + hub.durationMinutes * 60 * 1000;
  return Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
}
