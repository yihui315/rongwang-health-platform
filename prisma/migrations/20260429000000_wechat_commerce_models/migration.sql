-- CreateTable
CREATE TABLE "WechatUser" (
    "id" TEXT NOT NULL,
    "openId" TEXT NOT NULL,
    "unionId" TEXT,
    "sessionKeyHash" TEXT,
    "nickname" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WechatUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WechatOrder" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "openId" TEXT,
    "items" JSONB NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'unfulfilled',
    "customer" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WechatOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WechatPayment" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "openId" TEXT,
    "prepayId" TEXT,
    "transactionId" TEXT,
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "notifyPayload" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WechatPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WechatUser_openId_key" ON "WechatUser"("openId");

-- CreateIndex
CREATE INDEX "WechatUser_unionId_idx" ON "WechatUser"("unionId");

-- CreateIndex
CREATE INDEX "WechatUser_createdAt_idx" ON "WechatUser"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WechatOrder_orderNo_key" ON "WechatOrder"("orderNo");

-- CreateIndex
CREATE INDEX "WechatOrder_openId_idx" ON "WechatOrder"("openId");

-- CreateIndex
CREATE INDEX "WechatOrder_status_idx" ON "WechatOrder"("status");

-- CreateIndex
CREATE INDEX "WechatOrder_paymentStatus_idx" ON "WechatOrder"("paymentStatus");

-- CreateIndex
CREATE INDEX "WechatOrder_fulfillmentStatus_idx" ON "WechatOrder"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "WechatOrder_createdAt_idx" ON "WechatOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WechatPayment_orderNo_idx" ON "WechatPayment"("orderNo");

-- CreateIndex
CREATE INDEX "WechatPayment_openId_idx" ON "WechatPayment"("openId");

-- CreateIndex
CREATE INDEX "WechatPayment_transactionId_idx" ON "WechatPayment"("transactionId");

-- CreateIndex
CREATE INDEX "WechatPayment_status_idx" ON "WechatPayment"("status");

-- CreateIndex
CREATE INDEX "WechatPayment_createdAt_idx" ON "WechatPayment"("createdAt");

-- AddForeignKey
ALTER TABLE "WechatOrder" ADD CONSTRAINT "WechatOrder_openId_fkey" FOREIGN KEY ("openId") REFERENCES "WechatUser"("openId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WechatPayment" ADD CONSTRAINT "WechatPayment_orderNo_fkey" FOREIGN KEY ("orderNo") REFERENCES "WechatOrder"("orderNo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WechatPayment" ADD CONSTRAINT "WechatPayment_openId_fkey" FOREIGN KEY ("openId") REFERENCES "WechatUser"("openId") ON DELETE SET NULL ON UPDATE CASCADE;
