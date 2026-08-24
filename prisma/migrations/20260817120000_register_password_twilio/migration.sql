ALTER TABLE "User"
ADD COLUMN "username" TEXT,
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "dob" TIMESTAMP(3);

ALTER TABLE "PhoneVerificationCode"
ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'login',
ADD COLUMN "username" TEXT,
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "dob" TIMESTAMP(3);
