-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "capacity" INTEGER NOT NULL,
    "regDeadline" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailbox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mailType" TEXT,
    "registrationId" TEXT,

    CONSTRAINT "mailbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestHash" TEXT,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "competitions_organizerId_idx" ON "competitions"("organizerId");

-- CreateIndex
CREATE INDEX "competitions_regDeadline_idx" ON "competitions"("regDeadline");

-- CreateIndex
CREATE INDEX "competitions_startDate_idx" ON "competitions"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_idempotencyKey_key" ON "registrations"("idempotencyKey");

-- CreateIndex
CREATE INDEX "registrations_userId_idx" ON "registrations"("userId");

-- CreateIndex
CREATE INDEX "registrations_competitionId_idx" ON "registrations"("competitionId");

-- CreateIndex
CREATE INDEX "registrations_status_idx" ON "registrations"("status");

-- CreateIndex
CREATE INDEX "registrations_idempotencyKey_idx" ON "registrations"("idempotencyKey");

-- CreateIndex
CREATE INDEX "registrations_deletedAt_idx" ON "registrations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_userId_competitionId_key" ON "registrations"("userId", "competitionId");

-- CreateIndex
CREATE INDEX "mailbox_userId_idx" ON "mailbox"("userId");

-- CreateIndex
CREATE INDEX "mailbox_sentAt_idx" ON "mailbox"("sentAt");

-- CreateIndex
CREATE INDEX "failed_jobs_jobName_idx" ON "failed_jobs"("jobName");

-- CreateIndex
CREATE INDEX "failed_jobs_failedAt_idx" ON "failed_jobs"("failedAt");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_idempotencyKey_key" ON "idempotency_records"("idempotencyKey");

-- CreateIndex
CREATE INDEX "idempotency_records_idempotencyKey_idx" ON "idempotency_records"("idempotencyKey");

-- CreateIndex
CREATE INDEX "idempotency_records_expiresAt_idx" ON "idempotency_records"("expiresAt");

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
