-- CreateEnum
CREATE TYPE "PlatformAccountStatus" AS ENUM ('active', 'inactive', 'suspended', 'error');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'scheduled', 'publishing', 'published', 'failed');

-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountId" TEXT,
    "credentials" JSONB,
    "status" "PlatformAccountStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingPost" (
    "id" TEXT NOT NULL,
    "platformAccountId" TEXT,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "sourceArticleId" TEXT,
    "seoScore" INTEGER,
    "geoTags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "score" INTEGER NOT NULL,
    "issues" JSONB,
    "suggestions" JSONB,
    "jsonLdStatus" TEXT NOT NULL DEFAULT 'missing',
    "wikipediaStatus" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentCalendarEvent" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "platform" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoFlowSyncLog" (
    "id" TEXT NOT NULL,
    "articlesCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoFlowSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformAccount_platform_idx" ON "PlatformAccount"("platform");

-- CreateIndex
CREATE INDEX "PlatformAccount_status_idx" ON "PlatformAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAccount_platform_accountName_key" ON "PlatformAccount"("platform", "accountName");

-- CreateIndex
CREATE INDEX "MarketingPost_platform_idx" ON "MarketingPost"("platform");

-- CreateIndex
CREATE INDEX "MarketingPost_status_idx" ON "MarketingPost"("status");

-- CreateIndex
CREATE INDEX "MarketingPost_scheduledAt_idx" ON "MarketingPost"("scheduledAt");

-- CreateIndex
CREATE INDEX "MarketingPost_sourceArticleId_idx" ON "MarketingPost"("sourceArticleId");

-- CreateIndex
CREATE INDEX "SeoReport_postId_idx" ON "SeoReport"("postId");

-- CreateIndex
CREATE INDEX "ContentCalendarEvent_date_idx" ON "ContentCalendarEvent"("date");

-- CreateIndex
CREATE INDEX "ContentCalendarEvent_platform_idx" ON "ContentCalendarEvent"("platform");

-- AddForeignKey
ALTER TABLE "MarketingPost" ADD CONSTRAINT "MarketingPost_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "PlatformAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoReport" ADD CONSTRAINT "SeoReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "MarketingPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
