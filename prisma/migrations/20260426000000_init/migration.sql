-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "ref" TEXT,
    "utm" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "profileJson" JSONB NOT NULL,
    "symptoms" TEXT[],
    "aiResult" JSONB NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "recommendedSolutionType" TEXT,
    "source" TEXT,
    "recommendationSnapshot" JSONB,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "rawResponse" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "plans" TEXT[],
    "price" INTEGER NOT NULL,
    "memberPrice" INTEGER NOT NULL,
    "costPrice" INTEGER,
    "unit" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "matrix" TEXT,
    "hero" JSONB,
    "keyIngredients" JSONB,
    "scientificBasis" TEXT NOT NULL,
    "howToUse" TEXT NOT NULL,
    "warnings" TEXT[],
    "certifications" TEXT[],
    "stock" TEXT NOT NULL,
    "badge" TEXT,
    "shippingNote" TEXT,
    "images" TEXT[],
    "officialUrl" TEXT,
    "pddUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "condition" JSONB NOT NULL,
    "productIds" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "contact" TEXT,
    "source" TEXT,
    "intent" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PddClick" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "consultationId" TEXT,
    "productId" TEXT,
    "productSlug" TEXT,
    "source" TEXT,
    "solutionSlug" TEXT,
    "destinationUrl" TEXT,
    "ref" TEXT,
    "utm" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PddClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT,
    "consultationId" TEXT,
    "source" TEXT,
    "solutionSlug" TEXT,
    "productId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSession_createdAt_idx" ON "UserSession"("createdAt");

-- CreateIndex
CREATE INDEX "UserSession_source_idx" ON "UserSession"("source");

-- CreateIndex
CREATE INDEX "Consultation_createdAt_idx" ON "Consultation"("createdAt");

-- CreateIndex
CREATE INDEX "Consultation_riskLevel_idx" ON "Consultation"("riskLevel");

-- CreateIndex
CREATE INDEX "Consultation_recommendedSolutionType_idx" ON "Consultation"("recommendedSolutionType");

-- CreateIndex
CREATE INDEX "Consultation_source_idx" ON "Consultation"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_tier_idx" ON "Product"("tier");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "RecommendationRule_active_priority_idx" ON "RecommendationRule"("active", "priority");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "PddClick_createdAt_idx" ON "PddClick"("createdAt");

-- CreateIndex
CREATE INDEX "PddClick_consultationId_idx" ON "PddClick"("consultationId");

-- CreateIndex
CREATE INDEX "PddClick_productSlug_idx" ON "PddClick"("productSlug");

-- CreateIndex
CREATE INDEX "PddClick_source_idx" ON "PddClick"("source");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_source_idx" ON "AnalyticsEvent"("source");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_solutionSlug_idx" ON "AnalyticsEvent"("solutionSlug");

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PddClick" ADD CONSTRAINT "PddClick_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PddClick" ADD CONSTRAINT "PddClick_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
