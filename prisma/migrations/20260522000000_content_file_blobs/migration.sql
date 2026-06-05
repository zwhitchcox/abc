-- Store generated story content, images, schematics, and audio in SQLite.

CREATE TABLE "ContentFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "path" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "fileMtime" DATETIME
);

CREATE UNIQUE INDEX "ContentFile_path_key" ON "ContentFile"("path");
CREATE INDEX "ContentFile_sha256_idx" ON "ContentFile"("sha256");
