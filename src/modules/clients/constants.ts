export const CLIENT_HEARTBEAT_INTERVAL_MS = 15_000;

export const CLIENT_OFFLINE_THRESHOLD_SECONDS = 45;

export const CLIENT_RECONNECT_DELAYS_MS = [2_000, 5_000, 10_000, 30_000] as const;

export const CLIENT_CONNECTION_LOG_MAX = 100;

export const CLIENT_STORAGE_KEYS = {
  clientId: "examlink:clientId",
  serverUrl: "examlink:serverUrl",
  connectionLog: "examlink:connectionLog",
  studentContext: "examlink:studentContext",
} as const;

export const CLIENT_CONNECTION_EVENTS = {
  APP_STARTED: "app_started",
  SERVER_UNREACHABLE: "server_unreachable",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECTED: "reconnected",
  HEARTBEAT_FAILED: "heartbeat_failed",
  HEARTBEAT_OK: "heartbeat_ok",
  DISCONNECTED: "disconnected",
} as const;

export const SERVER_CONNECTION_EVENTS = {
  REGISTERED: "registered",
  RECONNECTED: "reconnected",
  DISCONNECTED: "disconnected",
  ACTIVITY_CHANGED: "activity_changed",
  STUDENT_BOUND: "student_bound",
  STUDENT_CLEARED: "student_cleared",
} as const;
