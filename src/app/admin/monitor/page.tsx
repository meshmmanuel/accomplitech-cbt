"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api-client";
import { formatDuration } from "@/lib/utils";
import type { MonitorLiveState } from "@/modules/clients/types";
import { formatWorkstationLabel } from "@/modules/clients/mappers";
import { AlertCircle, Check, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const POLL_MS = 5000;

function MonitorSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
      <div className="border-b border-exam-border px-4.5 py-3 text-[13px] font-bold text-exam-text">
        Live Connections
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-lg bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminMonitorPage() {
  const [state, setState] = useState<MonitorLiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(silent);

    const result = await apiGet<MonitorLiveState>("/api/monitor/live");

    setLoading(false);
    setRefreshing(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to load monitor");
      return;
    }

    setError("");
    setState(result.data);
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const clients = state?.clients ?? [];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void load(true)}
          disabled={refreshing}
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
        <div className="ml-auto flex gap-2.5">
          {[
            {
              label: "Online",
              value: state?.summary.online ?? 0,
              color: "text-exam-green",
              bg: "bg-emerald-50",
            },
            {
              label: "In exam",
              value: state?.summary.inExam ?? 0,
              color: "text-navy",
              bg: "bg-indigo-50",
            },
            {
              label: "Offline",
              value: state?.summary.offline ?? 0,
              color: "text-exam-red",
              bg: "bg-red-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 rounded-lg border border-exam-border px-3 py-1.5 ${item.bg}`}
            >
              <span className={`text-lg font-extrabold ${item.color}`}>
                {item.value}
              </span>
              <span className={`text-xs font-medium ${item.color}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading && <MonitorSkeleton />}

      {!loading && error && (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
          <AlertCircle size={28} className="mb-3 text-exam-red" />
          <p className="mb-1 text-[15px] font-bold text-exam-text">
            Failed to load monitor
          </p>
          <p className="mb-4 text-sm text-exam-muted">{error}</p>
          <Button variant="primary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
          <WifiOff size={28} className="mb-3 text-exam-muted" />
          <p className="mb-1 text-[15px] font-bold text-exam-text">
            No clients connected
          </p>
          <p className="text-sm text-exam-muted">
            Workstations appear here once they open the student app and
            heartbeat the server.
          </p>
        </div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
          <div className="flex items-center justify-between border-b border-exam-border px-4.5 py-3">
            <span className="text-[13px] font-bold text-exam-text">
              Live Connections
            </span>
            <div className="flex items-center gap-1 text-xs text-exam-green">
              <div className="h-1.5 w-1.5 rounded-full bg-exam-green" />
              Polling every {POLL_MS / 1000}s
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full border-collapse">
              <thead>
                <tr className="bg-surface">
                  {[
                    "Workstation",
                    "Student",
                    "Exam",
                    "Status",
                    "Progress",
                    "Time Left",
                    "IP",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-exam-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-exam-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const workstationLabel = formatWorkstationLabel(client.clientId);

                  return (
                  <tr key={client.clientId} className="border-b border-exam-border">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={workstationLabel}
                          bg={
                            client.presence === "online" ? "bg-navy" : "bg-gray-300"
                          }
                        />
                        <span className="font-mono text-xs font-semibold text-exam-text">
                          {workstationLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-exam-text">
                      {client.admissionNumber ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-bold text-navy">
                      {client.examLabel ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {client.presence === "online" ? (
                          client.status === "submitted" ? (
                            <Check size={12} className="text-navy" />
                          ) : (
                            <Wifi size={12} className="text-exam-green" />
                          )
                        ) : (
                          <WifiOff size={12} className="text-exam-red" />
                        )}
                        <Badge status={client.status} />
                      </div>
                    </td>
                    <td className="min-w-[110px] px-3 py-2.5">
                      {client.totalQuestions > 0 ? (
                        <>
                          <div className="mb-0.5 text-[10px] text-exam-muted">
                            Q{client.questionsAnswered}/{client.totalQuestions}
                          </div>
                          <div className="h-1 rounded-full bg-exam-border">
                            <div
                              className={`h-full rounded-full transition-all ${
                                client.status === "submitted"
                                  ? "bg-navy"
                                  : "bg-exam-green"
                              }`}
                              style={{ width: `${client.progressPct}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] text-exam-muted">—</span>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold ${
                        client.timeLeftSeconds !== null &&
                        client.timeLeftSeconds < 600 &&
                        client.timeLeftSeconds > 0
                          ? "text-exam-red"
                          : "text-exam-text"
                      }`}
                    >
                      {client.timeLeftSeconds !== null && client.timeLeftSeconds > 0
                        ? formatDuration(client.timeLeftSeconds)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-exam-muted">
                      {client.ipAddress ?? "—"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
