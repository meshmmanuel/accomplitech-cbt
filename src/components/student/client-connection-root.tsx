"use client";

import { useClientConnection } from "@/hooks/use-client-connection";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/modules/clients/types";

function statusLabel(status: ConnectionStatus) {
  switch (status) {
    case "online":
      return "Connected";
    case "degraded":
      return "Offline — using local data";
    case "reconnecting":
      return "Reconnecting…";
    default:
      return "Connecting…";
  }
}

function statusColor(status: ConnectionStatus) {
  switch (status) {
    case "online":
      return "bg-exam-green";
    case "degraded":
      return "bg-exam-amber";
    case "reconnecting":
      return "bg-exam-amber";
    default:
      return "bg-exam-muted";
  }
}

export function ClientConnectionRoot({ children }: { children: React.ReactNode }) {
  const { status, enabled } = useClientConnection();

  return (
    <>
      {children}
      {enabled && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-exam-border bg-exam-white px-3 py-1.5 text-xs font-medium text-exam-text shadow-sm"
          role="status"
          aria-live="polite"
        >
          <span className={cn("h-2 w-2 rounded-full", statusColor(status))} />
          {statusLabel(status)}
        </div>
      )}
    </>
  );
}
