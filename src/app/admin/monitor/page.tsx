"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { liveStudents as initialLive } from "@/data/mock/live";
import { formatDuration } from "@/lib/utils";
import {
  Check,
  Clock,
  Eye,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

type MonitorRow = {
  id: number;
  name: string;
  seat: string;
  exam: string;
  status: string;
  q: number;
  total: number;
  left: number;
  ip: string;
  pct: number;
};

export default function AdminMonitorPage() {
  const [liveStudents, setLiveStudents] = useState<MonitorRow[]>(
    initialLive.map((s) => ({ ...s })),
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveStudents((prev) =>
        prev.map((s) =>
          s.status === "active"
            ? {
                ...s,
                q: Math.min(s.q + (Math.random() > 0.75 ? 1 : 0), s.total),
                left: Math.max(0, s.left - 30),
              }
            : s,
        ),
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex gap-2">
          <Button
            variant={paused ? "success" : "danger"}
            size="sm"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <>
                <PlayCircle size={13} /> Resume All
              </>
            ) : (
              <>
                <PauseCircle size={13} /> Pause All
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <Clock size={13} /> Add Time
          </Button>
          <Button variant="purple" size="sm">
            <Send size={13} /> Broadcast
          </Button>
          <Button variant="ghost" size="sm">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
        <div className="ml-auto flex gap-2.5">
          {[
            {
              label: "Active",
              value: liveStudents.filter((s) => s.status === "active").length,
              color: "text-exam-green",
              bg: "bg-emerald-50",
            },
            {
              label: "Submitted",
              value: liveStudents.filter((s) => s.status === "submitted").length,
              color: "text-navy",
              bg: "bg-indigo-50",
            },
            {
              label: "Offline/Disconnected",
              value: liveStudents.filter((s) =>
                ["offline", "disconnected"].includes(s.status),
              ).length,
              color: "text-exam-red",
              bg: "bg-red-50",
            },
          ].map((c) => (
            <div
              key={c.label}
              className={`flex items-center gap-1.5 rounded-lg border border-exam-border px-3 py-1.5 ${c.bg}`}
            >
              <span className={`text-lg font-extrabold ${c.color}`}>
                {c.value}
              </span>
              <span className={`text-xs font-medium ${c.color}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {paused && (
        <div className="mb-3.5 flex items-center gap-2 rounded-[10px] border border-exam-amber bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800">
          <PauseCircle size={15} />
          <strong>Session paused.</strong> All student timers are frozen.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
        <div className="flex items-center justify-between border-b border-exam-border px-4.5 py-3">
          <span className="text-[13px] font-bold text-exam-text">
            Live Connections
          </span>
          <div className="flex items-center gap-1 text-xs text-exam-green">
            <div className="h-1.5 w-1.5 rounded-full bg-exam-green" />
            Live
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse">
            <thead>
              <tr className="bg-surface">
                {[
                  "Student",
                  "Seat",
                  "Exam",
                  "Status",
                  "Progress",
                  "Time Left",
                  "IP",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-exam-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-exam-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveStudents.map((s) => (
                <tr key={s.id} className="border-b border-exam-border">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        name={s.name}
                        bg={
                          ["offline", "disconnected"].includes(s.status)
                            ? "bg-gray-300"
                            : "bg-navy"
                        }
                      />
                      <span className="text-xs font-semibold text-exam-text">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-bold text-exam-muted">
                    {s.seat}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-bold text-navy">
                    {s.exam}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {s.status === "active" ? (
                        <Wifi size={12} className="text-exam-green" />
                      ) : s.status === "submitted" ? (
                        <Check size={12} className="text-navy" />
                      ) : (
                        <WifiOff size={12} className="text-exam-red" />
                      )}
                      <Badge status={s.status} />
                    </div>
                  </td>
                  <td className="min-w-[110px] px-3 py-2.5">
                    <div className="mb-0.5 text-[10px] text-exam-muted">
                      Q{s.q}/{s.total}
                    </div>
                    <div className="h-1 rounded-full bg-exam-border">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.status === "submitted" ? "bg-navy" : "bg-exam-green"
                        }`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold ${
                      s.left < 600 && s.left > 0
                        ? "text-exam-red"
                        : "text-exam-text"
                    }`}
                  >
                    {s.left > 0 ? formatDuration(s.left) : "—"}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-exam-muted">
                    {s.ip}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {s.status === "disconnected" && (
                        <Button variant="success" size="sm">
                          <RefreshCw size={11} /> Reset
                        </Button>
                      )}
                      {s.status === "active" && (
                        <Button variant="ghost" size="sm">
                          <Eye size={11} /> View
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
