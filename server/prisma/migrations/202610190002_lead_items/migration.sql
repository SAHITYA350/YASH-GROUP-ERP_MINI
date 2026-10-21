CREATE TABLE "LeadItem" (
  "id" SERIAL NOT NULL,
  "leadId" INTEGER NOT NULL,
  "productId" INTEGER,
  "productName" TEXT NOT NULL,
  "productSku" TEXT,
  "variant" TEXT,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadItem_leadId_idx" ON "LeadItem"("leadId");
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;