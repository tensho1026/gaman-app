-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "GamanTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamanTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GamanTarget_userId_createdAt_idx" ON "GamanTarget"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DailyCount_userId_dateKey_idx" ON "DailyCount"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCount_targetId_dateKey_key" ON "DailyCount"("targetId", "dateKey");

-- AddForeignKey
ALTER TABLE "DailyCount" ADD CONSTRAINT "DailyCount_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "GamanTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
