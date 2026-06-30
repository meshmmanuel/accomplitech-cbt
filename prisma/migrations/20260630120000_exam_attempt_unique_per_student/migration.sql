-- Remove duplicate attempts keeping the newest row per session/exam/admission.
DELETE FROM "ExamAttempt"
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "sessionId", "examId", "admissionNumber"
        ORDER BY "startedAt" DESC
      ) AS row_num
    FROM "ExamAttempt"
  ) ranked
  WHERE row_num > 1
);

CREATE UNIQUE INDEX "ExamAttempt_sessionId_examId_admissionNumber_key" ON "ExamAttempt"("sessionId", "examId", "admissionNumber");
