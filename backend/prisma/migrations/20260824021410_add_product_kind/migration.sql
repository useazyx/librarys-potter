-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('BOOK', 'BOX_SET', 'SPECIAL_EDITION', 'COLLECTIBLE');

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "kind" "ProductKind" NOT NULL DEFAULT 'BOOK',
ALTER COLUMN "isbn" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL,
ALTER COLUMN "publisherId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "books_kind_idx" ON "books"("kind");
