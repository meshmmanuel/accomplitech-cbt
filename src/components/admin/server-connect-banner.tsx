"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { ServerInfo } from "@/modules/clients/types";
import { Copy, Server } from "lucide-react";

export function ServerConnectBanner() {
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void apiGet<ServerInfo>("/api/server/info").then((result) => {
      if (result.data) setInfo(result.data);
    });
  }, []);

  if (!info) return null;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(info.studentLoginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-exam-border bg-exam-white px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
          <Server size={15} className="text-gold" />
        </div>
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-exam-muted">
            Client connect URL
          </p>
          <p className="m-0 font-mono text-sm font-bold text-navy">
            {info.studentLoginUrl}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void copyUrl()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-exam-border px-3 py-1.5 text-xs font-semibold text-exam-text hover:bg-surface"
      >
        <Copy size={13} />
        {copied ? "Copied" : "Copy URL"}
      </button>
    </div>
  );
}
