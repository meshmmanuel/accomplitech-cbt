-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "displayName" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "timeSpentSeconds" INTEGER,
    "score" REAL,
    "theoryScore" REAL,
    "gradedAt" DATETIME,
    "gradedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT "ExamAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamAttempt_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExamAttempt" ("admissionNumber", "displayName", "examId", "gradedAt", "gradedById", "id", "score", "sessionId", "startedAt", "status", "submittedAt", "theoryScore", "timeSpentSeconds") SELECT "admissionNumber", "displayName", "examId", "gradedAt", "gradedById", "id", "score", "sessionId", "startedAt", "status", "submittedAt", "theoryScore", "timeSpentSeconds" FROM "ExamAttempt";
DROP TABLE "ExamAttempt";
ALTER TABLE "new_ExamAttempt" RENAME TO "ExamAttempt";
CREATE INDEX "ExamAttempt_admissionNumber_idx" ON "ExamAttempt"("admissionNumber");
CREATE UNIQUE INDEX "ExamAttempt_sessionId_examId_admissionNumber_key" ON "ExamAttempt"("sessionId", "examId", "admissionNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
