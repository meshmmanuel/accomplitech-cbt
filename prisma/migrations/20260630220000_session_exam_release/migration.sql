-- AlterTable
ALTER TABLE "ExamSessionExam" ADD COLUMN "isReleased" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExamSessionExam" ADD COLUMN "releasedAt" DATETIME;
