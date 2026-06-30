-- CreateTable
CREATE TABLE "ServiceGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffServiceGroup" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffServiceGroup_pkey" PRIMARY KEY ("id")
);

-- Add nullable group column before backfilling.
ALTER TABLE "Service" ADD COLUMN "groupId" INTEGER;

-- One initial group per existing service name.
INSERT INTO "ServiceGroup" ("name")
SELECT DISTINCT "name"
FROM "Service";

-- Attach each existing service to its matching group.
UPDATE "Service"
SET "groupId" = "ServiceGroup"."id"
FROM "ServiceGroup"
WHERE "Service"."name" = "ServiceGroup"."name";

-- Preserve staff capability assignments at group level.
INSERT INTO "StaffServiceGroup" ("staffId", "groupId")
SELECT DISTINCT "StaffService"."staffId", "Service"."groupId"
FROM "StaffService"
JOIN "Service" ON "Service"."id" = "StaffService"."serviceId"
WHERE "Service"."groupId" IS NOT NULL;

-- Make group relation required after backfill.
ALTER TABLE "Service" ALTER COLUMN "groupId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StaffServiceGroup_staffId_groupId_key" ON "StaffServiceGroup"("staffId", "groupId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ServiceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffServiceGroup" ADD CONSTRAINT "StaffServiceGroup_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffServiceGroup" ADD CONSTRAINT "StaffServiceGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ServiceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old individual service capability table.
DROP TABLE "StaffService";
