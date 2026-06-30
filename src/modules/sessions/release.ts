export function filterVisibleSessionExams<
  T extends { examId: string; isReleased: boolean },
>(links: T[], attemptedExamIds: ReadonlySet<string>): T[] {
  return links.filter(
    (link) => link.isReleased || attemptedExamIds.has(link.examId),
  );
}

export function countReleasedSessionExams<
  T extends { isReleased: boolean },
>(links: T[]): number {
  return links.filter((link) => link.isReleased).length;
}
