-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);
