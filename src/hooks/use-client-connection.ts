"use client";

import type { ClientActivity } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  appendConnectionLog,
  getOrCreateClientId,
  getServerUrl,
  getStudentClientContext,
  resolveApiUrl,
  setStudentClientContext,
} from "@/lib/client-storage";
import {
  CLIENT_CONNECTION_EVENTS,
  CLIENT_HEARTBEAT_INTERVAL_MS,
  CLIENT_RECONNECT_DELAYS_MS,
} from "@/modules/clients/constants";
import { activityFromPathname } from "@/modules/clients/mappers";
import type {
  ConnectionStatus,
  ClientPingResponse,
} from "@/modules/clients/types";
import type { AuthSession } from "@/modules/auth/types";

function sessionIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/session\/([^/]+)/);
  return match?.[1];
}

function attemptIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/exam\/([^/]+)/);
  const attemptId = match?.[1];
  if (!attemptId || attemptId === "demo" || attemptId === "success") {
    return undefined;
  }
  return attemptId;
}

function hasAuthenticatedStudent(pathname: string) {
  return pathname.startsWith("/session") || pathname.startsWith("/exam/");
}

function isClientRoute(pathname: string) {
  if (pathname === "/exam/demo") return false;
  return (
    pathname.startsWith("/student") ||
    pathname.startsWith("/session") ||
    pathname.startsWith("/exam")
  );
}

export function useClientConnection() {
  const pathname = usePathname();
  const enabled = isClientRoute(pathname);
  const activity: ClientActivity = enabled
    ? activityFromPathname(pathname)
    : "IDLE";

  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const reconnectAttemptRef = useRef(0);
  const wasOnlineRef = useRef(false);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendHeartbeat = useCallback(
    async (reconnecting = false): Promise<boolean> => {
      const clientId = getOrCreateClientId();
      if (!clientId) return false;

      const authenticated = hasAuthenticatedStudent(pathname);
      const studentContext = getStudentClientContext();
      const sessionId =
        sessionIdFromPath(pathname) ?? studentContext?.sessionId;
      const admissionNumber = studentContext?.admissionNumber;
      const activeAttemptId = attemptIdFromPath(pathname);

      const result = await apiPost<ClientPingResponse>("/api/clients/ping", {
        client: {
          id: clientId,
          activity,
        },
        student: authenticated
          ? {
              authenticated: true,
              sessionId,
              admissionNumber,
              activeAttemptId,
            }
          : { authenticated: false },
        reconnecting,
      });

      if (result.error || !result.data) {
        appendConnectionLog(
          CLIENT_CONNECTION_EVENTS.HEARTBEAT_FAILED,
          result.error ?? result.message,
        );
        setStatus(wasOnlineRef.current ? "reconnecting" : "degraded");
        return false;
      }

      if (!wasOnlineRef.current || reconnecting) {
        appendConnectionLog(CLIENT_CONNECTION_EVENTS.RECONNECTED);
      }

      wasOnlineRef.current = true;
      reconnectAttemptRef.current = 0;
      setStatus("online");
      return true;
    },
    [activity, pathname],
  );

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const delay =
      CLIENT_RECONNECT_DELAYS_MS[
        Math.min(
          reconnectAttemptRef.current,
          CLIENT_RECONNECT_DELAYS_MS.length - 1,
        )
      ];

    appendConnectionLog(
      CLIENT_CONNECTION_EVENTS.RECONNECT_ATTEMPT,
      `retry in ${delay}ms`,
    );

    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptRef.current += 1;
      void sendHeartbeat(true);
    }, delay);
  }, [sendHeartbeat]);

  const runConnectionCycle = useCallback(async () => {
    const ok = await sendHeartbeat(reconnectAttemptRef.current > 0);
    if (!ok) {
      scheduleReconnect();
    }
  }, [scheduleReconnect, sendHeartbeat]);

  useEffect(() => {
    if (!enabled) return;

    appendConnectionLog(CLIENT_CONNECTION_EVENTS.APP_STARTED, getServerUrl());
    setStatus("connecting");
    void runConnectionCycle();

    heartbeatTimerRef.current = setInterval(() => {
      void runConnectionCycle();
    }, CLIENT_HEARTBEAT_INTERVAL_MS);

    const handleUnload = () => {
      const clientId = getOrCreateClientId();
      if (!clientId) return;

      appendConnectionLog(CLIENT_CONNECTION_EVENTS.DISCONNECTED);
      const payload = JSON.stringify({ clientId });
      navigator.sendBeacon(
        resolveApiUrl("/api/clients/disconnect"),
        new Blob([payload], { type: "application/json" }),
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [enabled, runConnectionCycle]);

  useEffect(() => {
    if (!enabled) return;
    void runConnectionCycle();
  }, [activity, enabled, runConnectionCycle]);

  useEffect(() => {
    if (!enabled || !hasAuthenticatedStudent(pathname)) return;
    if (getStudentClientContext()) return;

    void (async () => {
      const result = await apiGet<AuthSession>("/api/auth/me");
      if (result.data?.kind !== "student" || !result.data.student) return;

      setStudentClientContext({
        admissionNumber: result.data.student.admissionNumber,
        sessionId: result.data.student.sessionId,
      });
      void runConnectionCycle();
    })();
  }, [enabled, pathname, runConnectionCycle]);

  return { status, enabled };
}
