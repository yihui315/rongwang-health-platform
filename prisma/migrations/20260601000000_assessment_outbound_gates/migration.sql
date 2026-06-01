-- Add sensitive health retention and manual review metadata.
ALTER TABLE "UserHealthProfile" ADD COLUMN "retentionExpiresAt" TIMESTAMP(3);

ALTER TABLE "AssessmentReport"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending_manual_review',
  ADD COLUMN "reviewNotes" TEXT,
  ADD COLUMN "reviewer" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "retentionExpiresAt" TIMESTAMP(3);

ALTER TABLE "Lead"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sensitiveHealthDataAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "marketingContactAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "consentVersion" TEXT,
  ADD COLUMN "consentedAt" TIMESTAMP(3),
  ADD COLUMN "retentionExpiresAt" TIMESTAMP(3),
  ADD COLUMN "stopContactRequested" BOOLEAN NOT NULL DEFAULT false;

-- Store AI marketing plans as reviewable, traceable drafts.
CREATE TABLE "MarketingPlan" (
    "id" TEXT NOT NULL,
    "campaignSlug" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "solutionSlug" TEXT,
    "channels" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending_manual_review',
    "planJson" JSONB NOT NULL,
    "complianceJson" JSONB NOT NULL,
    "reviewHistory" JSONB,
    "metadata" JSONB,
    "retentionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPlan_pkey" PRIMARY KEY ("id")
);

-- Queue entries are blocked by default; real sends require every gate to pass.
CREATE TABLE "OutboundQueueEntry" (
    "id" TEXT NOT NULL,
    "marketingPlanId" TEXT NOT NULL,
    "leadId" TEXT,
    "channel" TEXT NOT NULL,
    "destination" TEXT,
    "status" TEXT NOT NULL DEFAULT 'blocked',
    "blockedReasons" TEXT[],
    "gateSnapshot" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundQueueEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SendEvent" (
    "id" TEXT NOT NULL,
    "outboundQueueEntryId" TEXT,
    "marketingPlanId" TEXT,
    "channel" TEXT NOT NULL,
    "provider" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "responseJson" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actor" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserHealthProfile_retentionExpiresAt_idx" ON "UserHealthProfile"("retentionExpiresAt");
CREATE INDEX "AssessmentReport_status_idx" ON "AssessmentReport"("status");
CREATE INDEX "AssessmentReport_retentionExpiresAt_idx" ON "AssessmentReport"("retentionExpiresAt");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_retentionExpiresAt_idx" ON "Lead"("retentionExpiresAt");

CREATE INDEX "MarketingPlan_campaignSlug_idx" ON "MarketingPlan"("campaignSlug");
CREATE INDEX "MarketingPlan_status_idx" ON "MarketingPlan"("status");
CREATE INDEX "MarketingPlan_createdAt_idx" ON "MarketingPlan"("createdAt");
CREATE INDEX "MarketingPlan_retentionExpiresAt_idx" ON "MarketingPlan"("retentionExpiresAt");

CREATE INDEX "OutboundQueueEntry_marketingPlanId_idx" ON "OutboundQueueEntry"("marketingPlanId");
CREATE INDEX "OutboundQueueEntry_leadId_idx" ON "OutboundQueueEntry"("leadId");
CREATE INDEX "OutboundQueueEntry_channel_idx" ON "OutboundQueueEntry"("channel");
CREATE INDEX "OutboundQueueEntry_status_idx" ON "OutboundQueueEntry"("status");
CREATE INDEX "OutboundQueueEntry_createdAt_idx" ON "OutboundQueueEntry"("createdAt");

CREATE INDEX "SendEvent_outboundQueueEntryId_idx" ON "SendEvent"("outboundQueueEntryId");
CREATE INDEX "SendEvent_marketingPlanId_idx" ON "SendEvent"("marketingPlanId");
CREATE INDEX "SendEvent_channel_idx" ON "SendEvent"("channel");
CREATE INDEX "SendEvent_status_idx" ON "SendEvent"("status");
CREATE INDEX "SendEvent_createdAt_idx" ON "SendEvent"("createdAt");

CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

ALTER TABLE "OutboundQueueEntry" ADD CONSTRAINT "OutboundQueueEntry_marketingPlanId_fkey" FOREIGN KEY ("marketingPlanId") REFERENCES "MarketingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OutboundQueueEntry" ADD CONSTRAINT "OutboundQueueEntry_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendEvent" ADD CONSTRAINT "SendEvent_outboundQueueEntryId_fkey" FOREIGN KEY ("outboundQueueEntryId") REFERENCES "OutboundQueueEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
