-- Canonical question JSON migration with backfill for existing rows
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "answer" JSONB,
    "assets" JSONB,
    "text" TEXT NOT NULL,
    "imagePath" TEXT,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "topic" TEXT,
    "difficulty" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Question" (
    "id",
    "examId",
    "questionType",
    "type",
    "content",
    "answer",
    "assets",
    "text",
    "imagePath",
    "marks",
    "topic",
    "difficulty",
    "options",
    "correctAnswer",
    "explanation",
    "tags",
    "status",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "examId",
    CASE WHEN "type" = 'OBJECTIVE' THEN 'multiple_choice' ELSE 'essay' END,
    "type",
    json_array(json_object('kind', 'text', 'value', "text")),
    CASE
        WHEN "type" = 'OBJECTIVE' AND "correctAnswer" IS NOT NULL
            THEN json_object('kind', 'single', 'value', "correctAnswer")
        ELSE json_object('kind', 'essay', 'value', NULL)
    END,
    NULL,
    "text",
    "imagePath",
    "marks",
    "topic",
    "difficulty",
    "options",
    "correctAnswer",
    "explanation",
    "tags",
    "status",
    "sortOrder",
    "createdAt",
    "updatedAt"
FROM "Question";

DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
