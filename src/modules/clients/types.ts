import type { ClientActivity } from "@prisma/client";

export type ClientPresence = "online" | "offline" | "disconnected";

export type MonitorBadgeStatus =
  | "active"
  | "idle"
  | "submitted"
  | "offline"
  | "disconnected";

export interface HeartbeatPayload {
  clientId: string;
  activity: ClientActivity;
  studentAuthenticated?: boolean;
  sessionId?: string;
  admissionNumber?: string;
  activeAttemptId?: string;
  reconnecting?: boolean;
}

export interface HeartbeatResult {
  clientId: string;
  serverTime: string;
  presence: ClientPresence;
}

export interface ClientPingRequest {
  client: {
    id: string;
    activity: ClientActivity;
  };
  student?: {
    authenticated: boolean;
    sessionId?: string;
    admissionNumber?: string;
    activeAttemptId?: string;
  };
  reconnecting?: boolean;
}

export interface ClientPingResponse {
  server: ServerInfo & { time: string };
  client: {
    id: string;
    presence: ClientPresence;
  };
}

export interface ServerInfo {
  baseUrl: string;
  studentLoginUrl: string;
  lanIp: string | null;
  port: number;
  hostname: string;
}

export interface MonitorClientRow {
  clientId: string;
  ipAddress: string | null;
  presence: ClientPresence;
  activity: ClientActivity;
  status: MonitorBadgeStatus;
  admissionNumber: string | null;
  displayName: string | null;
  examLabel: string | null;
  questionsAnswered: number;
  totalQuestions: number;
  progressPct: number;
  timeLeftSeconds: number | null;
  lastSeenAt: string;
}

export interface MonitorLiveState {
  clients: MonitorClientRow[];
  summary: {
    online: number;
    offline: number;
    inExam: number;
    idle: number;
  };
  serverTime: string;
}

export interface ClientConnectionLogEntry {
  at: string;
  event: string;
  detail?: string;
}

export type ConnectionStatus = "connecting" | "online" | "degraded" | "reconnecting";
