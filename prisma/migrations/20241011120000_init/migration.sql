-- Create enums
CREATE TYPE "Severity" AS ENUM ('OK', 'WARN', 'CRIT');
CREATE TYPE "Comparison" AS ENUM ('gt', 'lt');

-- Telemetry events
CREATE TABLE "Telemetry" (
    "id" SERIAL PRIMARY KEY,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL
);

CREATE INDEX "Telemetry_timestamp_idx" ON "Telemetry" ("timestamp");

-- Feedback records
CREATE TABLE "Feedback" (
    "id" SERIAL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reviewer" TEXT,
    "notes" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Feedback_ts_idx" ON "Feedback" ("ts");

-- Score history
CREATE TABLE "Score" (
    "id" SERIAL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'OK',
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Score_metric_ts_idx" ON "Score" ("metric", "ts");

-- Evaluation configuration
CREATE TABLE "EvaluationConfig" (
    "id" SERIAL PRIMARY KEY,
    "metric" TEXT NOT NULL,
    "comparison" "Comparison" NOT NULL DEFAULT 'gt',
    "warn" DOUBLE PRECISION NOT NULL,
    "crit" DOUBLE PRECISION NOT NULL,
    "windowSeconds" INTEGER NOT NULL DEFAULT 300,
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "EvaluationConfig_metric_key" ON "EvaluationConfig" ("metric");

-- Trigger to keep updatedAt in sync with prisma @updatedAt semantics
CREATE OR REPLACE FUNCTION prisma_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EvaluationConfig_updatedAt"
BEFORE UPDATE ON "EvaluationConfig"
FOR EACH ROW
EXECUTE FUNCTION prisma_set_updated_at();
