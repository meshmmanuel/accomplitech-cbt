-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN "theoryScore" REAL;
ALTER TABLE "ExamAttempt" ADD COLUMN "gradedAt" DATETIME;
ALTER TABLE "ExamAttempt" ADD COLUMN "gradedById" TEXT;

-- AlterTable
ALTER TABLE "ExamAnswer" ADD COLUMN "marksAwarded" INTEGER;

-- CreateIndex
CREATE INDEX "ExamAttempt_gradedById_idx" ON "ExamAttempt"("gradedById");
