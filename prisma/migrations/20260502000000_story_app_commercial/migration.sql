-- Commercial story app subscription, word-list, and generation tracking tables.

CREATE TABLE "StorySubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "priceCents" INTEGER NOT NULL DEFAULT 2000,
    "includedCostCents" INTEGER NOT NULL DEFAULT 1000,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    CONSTRAINT "StorySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StorySubscription_userId_key" ON "StorySubscription"("userId");
CREATE UNIQUE INDEX "StorySubscription_stripeCustomerId_key" ON "StorySubscription"("stripeCustomerId");
CREATE UNIQUE INDEX "StorySubscription_stripeSubscriptionId_key" ON "StorySubscription"("stripeSubscriptionId");

CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "ChildProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ChildProfile_ownerId_idx" ON "ChildProfile"("ownerId");

CREATE TABLE "ChildWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    CONSTRAINT "ChildWord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChildWord_childId_word_key" ON "ChildWord"("childId", "word");
CREATE INDEX "ChildWord_childId_category_idx" ON "ChildWord"("childId", "category");

CREATE TABLE "GeneratedStory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "childId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "prompt" TEXT NOT NULL,
    "sourceText" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 10,
    "wordList" TEXT NOT NULL DEFAULT '[]',
    "modelPlan" TEXT NOT NULL DEFAULT '{}',
    "estimatedCostCents" INTEGER NOT NULL DEFAULT 0,
    "actualCostCents" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GeneratedStory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneratedStory_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "GeneratedStory_ownerId_createdAt_idx" ON "GeneratedStory"("ownerId", "createdAt");
CREATE INDEX "GeneratedStory_childId_idx" ON "GeneratedStory"("childId");

CREATE TABLE "GeneratedStoryPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "storyId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imagePrompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "assetPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    CONSTRAINT "GeneratedStoryPage_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "GeneratedStory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GeneratedStoryPage_storyId_pageNumber_key" ON "GeneratedStoryPage"("storyId", "pageNumber");
CREATE INDEX "GeneratedStoryPage_storyId_idx" ON "GeneratedStoryPage"("storyId");

CREATE TABLE "StoryGenerationUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "storyId" TEXT,
    "kind" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "costCents" INTEGER NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "StoryGenerationUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryGenerationUsage_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "GeneratedStory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "StoryGenerationUsage_userId_createdAt_idx" ON "StoryGenerationUsage"("userId", "createdAt");
CREATE INDEX "StoryGenerationUsage_storyId_idx" ON "StoryGenerationUsage"("storyId");

CREATE TABLE "StoryCreditLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "note" TEXT,
    CONSTRAINT "StoryCreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StoryCreditLedger_stripePaymentIntentId_key" ON "StoryCreditLedger"("stripePaymentIntentId");
CREATE INDEX "StoryCreditLedger_userId_createdAt_idx" ON "StoryCreditLedger"("userId", "createdAt");
