-- CreateTable
CREATE TABLE "tag_similarities" (
    "id" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tagA_id" TEXT NOT NULL,
    "tagB_id" TEXT NOT NULL,

    CONSTRAINT "tag_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_similarities_tagA_id_tagB_id_key" ON "tag_similarities"("tagA_id", "tagB_id");

-- AddForeignKey
ALTER TABLE "tag_similarities" ADD CONSTRAINT "tag_similarities_tagA_id_fkey" FOREIGN KEY ("tagA_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_similarities" ADD CONSTRAINT "tag_similarities_tagB_id_fkey" FOREIGN KEY ("tagB_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
