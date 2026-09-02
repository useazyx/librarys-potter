-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductKind" ADD VALUE 'WAND';
ALTER TYPE "ProductKind" ADD VALUE 'FIGURE';
ALTER TYPE "ProductKind" ADD VALUE 'APPAREL';
ALTER TYPE "ProductKind" ADD VALUE 'ACCESSORY';
ALTER TYPE "ProductKind" ADD VALUE 'STATIONERY';
ALTER TYPE "ProductKind" ADD VALUE 'GAME';
ALTER TYPE "ProductKind" ADD VALUE 'HOME';

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "character" TEXT,
ADD COLUMN     "compareAtPrice" DECIMAL(10,2),
ADD COLUMN     "house" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "books_house_idx" ON "books"("house");

-- CreateIndex
CREATE INDEX "books_brand_idx" ON "books"("brand");
