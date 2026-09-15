CREATE TYPE "WorkdayStatus" AS ENUM ('ACTIVE', 'PAUSED', 'FINALIZED');

ALTER TABLE "Customer" ADD COLUMN "lastShipmentAt" TIMESTAMP(3);

CREATE TABLE "Workday" (
  "id" TEXT NOT NULL,
  "status" "WorkdayStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pausedAt" TIMESTAMP(3),
  "finalizedAt" TIMESTAMP(3),
  "pdfGeneratedAt" TIMESTAMP(3),
  "pdfData" BYTEA,
  "directorySavedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "lastEditorId" TEXT,
  "lastActivityAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Workday_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerRelation" (
  "id" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "usageCount" INTEGER NOT NULL DEFAULT 1,
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerRelation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Shipment" ADD COLUMN "workdayId" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "sheetIndex" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Parcel" ADD COLUMN "span" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Parcel" ADD COLUMN "packageCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Parcel" ALTER COLUMN "packageNumber" DROP NOT NULL;
ALTER TABLE "Parcel" ALTER COLUMN "senderName" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "senderPhone" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "senderAddress" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "recipientName" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "recipientPhone" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "recipientAddress" SET DEFAULT '';
ALTER TABLE "Parcel" ALTER COLUMN "weight" DROP NOT NULL;
ALTER TABLE "Parcel" ALTER COLUMN "description" SET DEFAULT '';

CREATE INDEX "Workday_status_idx" ON "Workday"("status");
CREATE INDEX "Workday_finalizedAt_idx" ON "Workday"("finalizedAt");
CREATE UNIQUE INDEX "Workday_single_open_key" ON "Workday" ((TRUE)) WHERE "status" IN ('ACTIVE', 'PAUSED');
CREATE INDEX "Shipment_workdayId_sheetIndex_idx" ON "Shipment"("workdayId", "sheetIndex");
CREATE UNIQUE INDEX "CustomerRelation_senderId_recipientId_key" ON "CustomerRelation"("senderId", "recipientId");
CREATE INDEX "CustomerRelation_senderId_usageCount_idx" ON "CustomerRelation"("senderId", "usageCount");

ALTER TABLE "Workday" ADD CONSTRAINT "Workday_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Workday" ADD CONSTRAINT "Workday_lastEditorId_fkey" FOREIGN KEY ("lastEditorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "Workday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerRelation" ADD CONSTRAINT "CustomerRelation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerRelation" ADD CONSTRAINT "CustomerRelation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
