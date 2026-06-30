-- CreateTable
CREATE TABLE "ExamClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT,
    "seatLabel" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "activity" TEXT NOT NULL DEFAULT 'IDLE',
    "sessionId" TEXT,
    "admissionNumber" TEXT,
    "activeAttemptId" TEXT,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExamClient_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientConnectionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "sessionId" TEXT,
    "admissionNumber" TEXT,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientConnectionEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ExamClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExamClient_lastSeenAt_idx" ON "ExamClient"("lastSeenAt");

-- CreateIndex
CREATE INDEX "ExamClient_institutionId_idx" ON "ExamClient"("institutionId");

-- CreateIndex
CREATE INDEX "ClientConnectionEvent_clientId_createdAt_idx" ON "ClientConnectionEvent"("clientId", "createdAt");
