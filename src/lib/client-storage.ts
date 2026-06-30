import {
  CLIENT_STORAGE_KEYS,
  CLIENT_CONNECTION_LOG_MAX,
} from "@/modules/clients/constants";
import type { ClientConnectionLogEntry } from "@/modules/clients/types";

export interface StudentClientContext {
  admissionNumber: string;
  sessionId: string;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function fallbackClientId() {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `client-${seed}`;
}

export function getOrCreateClientId(): string {
  if (!canUseStorage()) return "";

  const existing = localStorage.getItem(CLIENT_STORAGE_KEYS.clientId);
  if (existing) return existing;

  const created =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : fallbackClientId();
  localStorage.setItem(CLIENT_STORAGE_KEYS.clientId, created);
  return created;
}

export function getServerUrl(): string {
  if (!canUseStorage()) return "";

  const stored = localStorage.getItem(CLIENT_STORAGE_KEYS.serverUrl);
  if (stored) return stored.replace(/\/$/, "");

  return window.location.origin;
}

export function setServerUrl(url: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(CLIENT_STORAGE_KEYS.serverUrl, url.replace(/\/$/, ""));
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = getServerUrl();
  return `${base}${path}`;
}

export function appendConnectionLog(event: string, detail?: string) {
  if (!canUseStorage()) return;

  const entry: ClientConnectionLogEntry = {
    at: new Date().toISOString(),
    event,
    detail,
  };

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEYS.connectionLog);
    const existing = raw
      ? (JSON.parse(raw) as ClientConnectionLogEntry[])
      : [];
    const next = [entry, ...existing].slice(0, CLIENT_CONNECTION_LOG_MAX);
    localStorage.setItem(
      CLIENT_STORAGE_KEYS.connectionLog,
      JSON.stringify(next),
    );
  } catch {
    localStorage.setItem(
      CLIENT_STORAGE_KEYS.connectionLog,
      JSON.stringify([entry]),
    );
  }
}

export function readConnectionLog(): ClientConnectionLogEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEYS.connectionLog);
    if (!raw) return [];
    return JSON.parse(raw) as ClientConnectionLogEntry[];
  } catch {
    return [];
  }
}

export function setStudentClientContext(context: StudentClientContext) {
  if (!canUseStorage()) return;
  localStorage.setItem(
    CLIENT_STORAGE_KEYS.studentContext,
    JSON.stringify(context),
  );
}

export function getStudentClientContext(): StudentClientContext | null {
  if (!canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEYS.studentContext);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentClientContext;
    if (!parsed.admissionNumber || !parsed.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStudentClientContext() {
  if (!canUseStorage()) return;
  localStorage.removeItem(CLIENT_STORAGE_KEYS.studentContext);
}
