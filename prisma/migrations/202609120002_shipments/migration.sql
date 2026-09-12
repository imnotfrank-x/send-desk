CREATE TABLE IF NOT EXISTS "Shipment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sheetNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'READY',
  "createdById" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Shipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Parcel" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shipmentId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "packageNumber" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderPhone" TEXT NOT NULL,
  "senderAddress" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "recipientPhone" TEXT NOT NULL,
  "recipientAddress" TEXT NOT NULL,
  "weight" REAL NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Parcel_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_sheetNumber_key" ON "Shipment"("sheetNumber");
CREATE INDEX IF NOT EXISTS "Shipment_createdAt_idx" ON "Shipment"("createdAt");
CREATE INDEX IF NOT EXISTS "Shipment_status_idx" ON "Shipment"("status");
CREATE INDEX IF NOT EXISTS "Shipment_createdById_idx" ON "Shipment"("createdById");
CREATE UNIQUE INDEX IF NOT EXISTS "Parcel_packageNumber_key" ON "Parcel"("packageNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Parcel_shipmentId_position_key" ON "Parcel"("shipmentId", "position");
CREATE INDEX IF NOT EXISTS "Parcel_shipmentId_idx" ON "Parcel"("shipmentId");

