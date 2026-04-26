-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "aiSource" TEXT;

-- CreateTable
CREATE TABLE "MarketplaceJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT,
    "postcode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'AU',
    "budget" REAL,
    "urgency" TEXT NOT NULL DEFAULT 'FLEXIBLE',
    "photos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "awardedBidId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketplaceJob_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketplaceJobId" TEXT NOT NULL,
    "tradieId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT NOT NULL,
    "estimatedDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bid_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bid_tradieId_fkey" FOREIGN KEY ("tradieId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketplaceJobId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "quoteId" TEXT,
    "clientId" TEXT,
    "marketplaceJobId" TEXT,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "stripePaymentLink" TEXT,
    "platformFee" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "gst" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("clientId", "createdAt", "dueDate", "gst", "id", "notes", "number", "paidAt", "quoteId", "status", "stripePaymentLink", "subtotal", "title", "total", "updatedAt", "userId") SELECT "clientId", "createdAt", "dueDate", "gst", "id", "notes", "number", "paidAt", "quoteId", "status", "stripePaymentLink", "subtotal", "title", "total", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TRADIE',
    "tradeType" TEXT NOT NULL,
    "companyName" TEXT,
    "abn" TEXT,
    "nzbn" TEXT,
    "country" TEXT NOT NULL DEFAULT 'AU',
    "slug" TEXT,
    "bio" TEXT,
    "serviceArea" TEXT,
    "hourlyRate" REAL,
    "yearsExperience" INTEGER,
    "profileImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("abn", "companyName", "country", "createdAt", "email", "id", "name", "nzbn", "passwordHash", "phone", "tradeType", "updatedAt") SELECT "abn", "companyName", "country", "createdAt", "email", "id", "name", "nzbn", "passwordHash", "phone", "tradeType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceJob_awardedBidId_key" ON "MarketplaceJob"("awardedBidId");
