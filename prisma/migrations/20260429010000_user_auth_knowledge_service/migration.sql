-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "consentVersion" TEXT,
    "consentedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIdentity" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSubjectHash" TEXT NOT NULL,
    "unionIdHash" TEXT,
    "credentialHash" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "metadata" JSONB,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthSession" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHealthProfile" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "profileJson" JSONB NOT NULL,
    "consentVersion" TEXT,
    "snapshotVersion" TEXT NOT NULL DEFAULT 'health-profile-v1',
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentReport" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "consultationId" TEXT,
    "healthProfileId" TEXT,
    "title" TEXT,
    "profileJson" JSONB NOT NULL,
    "aiResult" JSONB NOT NULL,
    "safetyJson" JSONB NOT NULL,
    "recommendationsJson" JSONB,
    "riskLevel" TEXT NOT NULL,
    "recommendedSolutionType" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "reportVersion" TEXT NOT NULL DEFAULT 'assessment-report-v1',
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'internal',
    "url" TEXT,
    "publisher" TEXT,
    "citation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'reviewed',
    "reviewedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthKnowledgeEntry" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "audience" TEXT,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "evidenceLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "redFlags" TEXT[],
    "contraindications" TEXT[],
    "tags" TEXT[],
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthKnowledgeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductKnowledgeLink" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'education',
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductKnowledgeLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE INDEX "UserAccount_createdAt_idx" ON "UserAccount"("createdAt");

-- CreateIndex
CREATE INDEX "UserAccount_status_idx" ON "UserAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_provider_providerSubjectHash_key" ON "UserIdentity"("provider", "providerSubjectHash");

-- CreateIndex
CREATE INDEX "UserIdentity_userAccountId_idx" ON "UserIdentity"("userAccountId");

-- CreateIndex
CREATE INDEX "UserIdentity_unionIdHash_idx" ON "UserIdentity"("unionIdHash");

-- CreateIndex
CREATE INDEX "UserIdentity_provider_idx" ON "UserIdentity"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthSession_sessionTokenHash_key" ON "UserAuthSession"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "UserAuthSession_userAccountId_idx" ON "UserAuthSession"("userAccountId");

-- CreateIndex
CREATE INDEX "UserAuthSession_expiresAt_idx" ON "UserAuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "UserAuthSession_revokedAt_idx" ON "UserAuthSession"("revokedAt");

-- CreateIndex
CREATE INDEX "UserHealthProfile_userAccountId_createdAt_idx" ON "UserHealthProfile"("userAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "UserHealthProfile_source_idx" ON "UserHealthProfile"("source");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentReport_userAccountId_consultationId_key" ON "AssessmentReport"("userAccountId", "consultationId");

-- CreateIndex
CREATE INDEX "AssessmentReport_userAccountId_createdAt_idx" ON "AssessmentReport"("userAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentReport_riskLevel_idx" ON "AssessmentReport"("riskLevel");

-- CreateIndex
CREATE INDEX "AssessmentReport_recommendedSolutionType_idx" ON "AssessmentReport"("recommendedSolutionType");

-- CreateIndex
CREATE INDEX "KnowledgeSource_status_idx" ON "KnowledgeSource"("status");

-- CreateIndex
CREATE INDEX "KnowledgeSource_sourceType_idx" ON "KnowledgeSource"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "HealthKnowledgeEntry_slug_key" ON "HealthKnowledgeEntry"("slug");

-- CreateIndex
CREATE INDEX "HealthKnowledgeEntry_category_idx" ON "HealthKnowledgeEntry"("category");

-- CreateIndex
CREATE INDEX "HealthKnowledgeEntry_status_idx" ON "HealthKnowledgeEntry"("status");

-- CreateIndex
CREATE INDEX "HealthKnowledgeEntry_effectiveFrom_idx" ON "HealthKnowledgeEntry"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ProductKnowledgeLink_entryId_productSlug_key" ON "ProductKnowledgeLink"("entryId", "productSlug");

-- CreateIndex
CREATE INDEX "ProductKnowledgeLink_productSlug_idx" ON "ProductKnowledgeLink"("productSlug");

-- CreateIndex
CREATE INDEX "ProductKnowledgeLink_relationType_idx" ON "ProductKnowledgeLink"("relationType");

-- AddForeignKey
ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuthSession" ADD CONSTRAINT "UserAuthSession_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHealthProfile" ADD CONSTRAINT "UserHealthProfile_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReport" ADD CONSTRAINT "AssessmentReport_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReport" ADD CONSTRAINT "AssessmentReport_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReport" ADD CONSTRAINT "AssessmentReport_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "UserHealthProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthKnowledgeEntry" ADD CONSTRAINT "HealthKnowledgeEntry_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductKnowledgeLink" ADD CONSTRAINT "ProductKnowledgeLink_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "HealthKnowledgeEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductKnowledgeLink" ADD CONSTRAINT "ProductKnowledgeLink_productSlug_fkey" FOREIGN KEY ("productSlug") REFERENCES "Product"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
