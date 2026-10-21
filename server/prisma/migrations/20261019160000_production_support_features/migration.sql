CREATE TYPE "ProductionAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProductionCostType" AS ENUM ('MATERIAL', 'LABOR', 'MACHINE', 'OVERHEAD', 'WASTAGE', 'REWORK', 'SCRAP');
CREATE TYPE "CapaStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'ACTION_REQUIRED', 'VERIFYING', 'CLOSED');

CREATE TABLE "ProductionAlert" (
  "id" SERIAL NOT NULL, "code" TEXT NOT NULL, "type" TEXT NOT NULL, "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL, "message" TEXT NOT NULL, "workOrderId" INTEGER, "machineId" INTEGER, "productId" INTEGER,
  "status" "ProductionAlertStatus" NOT NULL DEFAULT 'OPEN', "acknowledgedById" INTEGER, "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductionAlert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductionAlert_code_key" ON "ProductionAlert"("code");
CREATE INDEX "ProductionAlert_status_createdAt_idx" ON "ProductionAlert"("status", "createdAt");
CREATE INDEX "ProductionAlert_type_createdAt_idx" ON "ProductionAlert"("type", "createdAt");

CREATE TABLE "MachineMaintenance" (
  "id" SERIAL NOT NULL, "machineId" INTEGER NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "maintenanceType" TEXT NOT NULL DEFAULT 'PREVENTIVE', "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "scheduledAt" TIMESTAMP(3), "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "downtimeMinutes" INTEGER NOT NULL DEFAULT 0,
  "cost" DECIMAL(14,2) NOT NULL DEFAULT 0, "reportedById" INTEGER, "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "MachineMaintenance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MachineMaintenance_machineId_status_scheduledAt_idx" ON "MachineMaintenance"("machineId", "status", "scheduledAt");

CREATE TABLE "ProductionCostEntry" (
  "id" SERIAL NOT NULL, "workOrderId" INTEGER NOT NULL, "type" "ProductionCostType" NOT NULL, "productId" INTEGER,
  "quantity" DECIMAL(14,3), "unitCost" DECIMAL(14,2) NOT NULL DEFAULT 0, "totalCost" DECIMAL(14,2) NOT NULL,
  "notes" TEXT, "recordedById" INTEGER, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductionCostEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductionCostEntry_workOrderId_type_occurredAt_idx" ON "ProductionCostEntry"("workOrderId", "type", "occurredAt");

CREATE TABLE "NonConformance" (
  "id" SERIAL NOT NULL, "code" TEXT NOT NULL, "workOrderId" INTEGER, "inspectionId" INTEGER, "defectId" INTEGER,
  "title" TEXT NOT NULL, "description" TEXT, "rootCause" TEXT, "containmentAction" TEXT, "correctiveAction" TEXT,
  "preventiveAction" TEXT, "status" "CapaStatus" NOT NULL DEFAULT 'OPEN', "ownerId" INTEGER, "dueAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3), "closedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "NonConformance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NonConformance_code_key" ON "NonConformance"("code");
CREATE INDEX "NonConformance_status_dueAt_idx" ON "NonConformance"("status", "dueAt");
CREATE INDEX "NonConformance_workOrderId_createdAt_idx" ON "NonConformance"("workOrderId", "createdAt");

CREATE TABLE "ProductionAuditEvent" (
  "id" SERIAL NOT NULL, "entityType" TEXT NOT NULL, "entityId" INTEGER NOT NULL, "action" TEXT NOT NULL,
  "fromValue" JSONB, "toValue" JSONB, "userId" INTEGER, "notes" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductionAuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductionAuditEvent_entityType_entityId_occurredAt_idx" ON "ProductionAuditEvent"("entityType", "entityId", "occurredAt");
CREATE INDEX "ProductionAuditEvent_userId_occurredAt_idx" ON "ProductionAuditEvent"("userId", "occurredAt");
