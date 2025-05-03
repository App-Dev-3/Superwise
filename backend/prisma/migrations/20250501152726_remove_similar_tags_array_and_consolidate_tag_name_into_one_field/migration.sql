/*
  Warnings:

  - You are about to drop the column `similar_tags` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `tag_name_de` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `tag_name_en` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tag_name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag_name` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tags_tag_name_de_key";

-- DropIndex
DROP INDEX "tags_tag_name_en_key";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "similar_tags",
DROP COLUMN "tag_name_de",
DROP COLUMN "tag_name_en",
ADD COLUMN     "tag_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_name_key" ON "tags"("tag_name");
