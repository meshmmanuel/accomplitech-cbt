export interface WorkspacePersistedState {
  activeExamId: string | null;
  doneExams: string[];
  currentByExam: Record<string, number>;
  openedExamIds: string[];
}

function storageKey(sessionId: string) {
  return `examlink:workspace:${sessionId}`;
}

export function loadWorkspaceState(
  sessionId: string,
): WorkspacePersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as WorkspacePersistedState;
  } catch {
    return null;
  }
}

export function saveWorkspaceState(
  sessionId: string,
  state: WorkspacePersistedState,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(sessionId), JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function clearWorkspaceState(sessionId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(sessionId));
}
