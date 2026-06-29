/** Deterministic accent colors for subject cards (bg + dot) */
export const SUBJECT_COLOR_PALETTE = [
  { color: "#EEF2FF", dot: "#1A2B5E" },
  { color: "#FDF4FF", dot: "#7C3AED" },
  { color: "#ECFDF5", dot: "#10B981" },
  { color: "#FFF7ED", dot: "#F59E0B" },
  { color: "#FEF2F2", dot: "#EF4444" },
  { color: "#F0F9FF", dot: "#0284C7" },
] as const;

export function getSubjectColors(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_COLOR_PALETTE.length;
  return SUBJECT_COLOR_PALETTE[index];
}
