-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('OK', 'WARN', 'CRIT');

-- CreateEnum
CREATE TYPE "Comparison" AS ENUM ('gt', 'lt');

-- CreateTable
CREATE TABLE "Telemetry" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reviewer" TEXT,
    "notes" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'OK',
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationConfig" (
    "id" SERIAL NOT NULL,
    "metric" TEXT NOT NULL,
    "comparison" "Comparison" NOT NULL DEFAULT 'gt',
    "warn" DOUBLE PRECISION NOT NULL,
    "crit" DOUBLE PRECISION NOT NULL,
    "windowSeconds" INTEGER NOT NULL DEFAULT 300,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Telemetry_timestamp_idx" ON "Telemetry"("timestamp");

-- CreateIndex
CREATE INDEX "Feedback_ts_idx" ON "Feedback"("ts");

-- CreateIndex
CREATE INDEX "Score_metric_ts_idx" ON "Score"("metric", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationConfig_metric_key" ON "EvaluationConfig"("metric");

