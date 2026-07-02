CREATE TABLE "ShopHours" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopHours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShopHours_dayOfWeek_key" ON "ShopHours"("dayOfWeek");

INSERT INTO "ShopHours" ("dayOfWeek", "openTime", "closeTime", "isClosed", "updatedAt")
VALUES
    (0, '09:00', '18:00', false, CURRENT_TIMESTAMP),
    (1, '09:00', '19:00', false, CURRENT_TIMESTAMP),
    (2, '09:00', '19:00', false, CURRENT_TIMESTAMP),
    (3, '09:00', '19:00', false, CURRENT_TIMESTAMP),
    (4, '09:00', '19:00', false, CURRENT_TIMESTAMP),
    (5, '09:00', '19:00', false, CURRENT_TIMESTAMP),
    (6, '09:00', '19:00', false, CURRENT_TIMESTAMP);
