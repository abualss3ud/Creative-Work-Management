-- BrandFlow Studio Initial Database Migration
-- PostgreSQL DDL Script

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'CLIENT');
CREATE TYPE "ClientStatus" AS ENUM ('LEAD', 'CONTACTED', 'NEGOTIATING', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ProjectStatus" AS ENUM ('BRIEFING', 'STRATEGY', 'MOODBOARD', 'CONCEPT_DESIGN', 'CLIENT_REVIEW', 'REVISIONS', 'GUIDELINES', 'DELIVERABLES', 'CLOSED');
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'SENT_TO_CLIENT', 'SIGNED', 'EXPIRED');
CREATE TYPE "DeliverableCategory" AS ENUM ('LOGO_VECTORS', 'BRAND_GUIDELINES', 'STATIONERY', 'SOCIAL_TEMPLATES', 'PACKAGING', 'TYPOGRAPHY_FONTS', 'SOURCE_FILES');
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'APPROVAL', 'PAYMENT', 'DELIVERY', 'STATUS_CHANGE');

-- Table: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "title" TEXT,
    "avatarUrl" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Table: studio_settings
CREATE TABLE "studio_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "studioName" TEXT NOT NULL DEFAULT 'استوديو فلو للهويات البصرية',
    "studioNameEn" TEXT NOT NULL DEFAULT 'Flow Brand Identity Studio',
    "tagline" TEXT NOT NULL DEFAULT 'تصميم واستراتيجية علامات تجارية تصنع الأثر',
    "taglineEn" TEXT NOT NULL DEFAULT 'Strategic Brand Identities That Drive Impact',
    "ownerName" TEXT NOT NULL DEFAULT 'راكان الشمري',
    "email" TEXT NOT NULL DEFAULT 'contact@brandflow.studio',
    "phone" TEXT NOT NULL DEFAULT '+966 50 123 4567',
    "address" TEXT NOT NULL DEFAULT 'الرياض، المملكة العربية السعودية',
    "taxNumber" TEXT NOT NULL DEFAULT '300123456700003',
    "crNumber" TEXT NOT NULL DEFAULT '1010789456',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'SAR',
    "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "defaultRevisionsCount" INTEGER NOT NULL DEFAULT 3,
    "defaultPaymentTerms" TEXT NOT NULL DEFAULT 'عربون 50% مقدمًا و50% عند تسليم الملفات النهائية',
    "bankName" TEXT NOT NULL DEFAULT 'مصرف الراجحي',
    "accountName" TEXT NOT NULL DEFAULT 'استوديو فلو للتصميم',
    "iban" TEXT NOT NULL DEFAULT 'SA0380000456608010167890',
    "swift" TEXT DEFAULT 'RJHISARI',
    "logoUrl" TEXT,
    "brandColor" TEXT NOT NULL DEFAULT '#171717',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_settings_pkey" PRIMARY KEY ("id")
);

-- Table: clients
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'السعودية',
    "industry" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'موقع إلكتروني',
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "internalNotes" TEXT,
    "portalAccessKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- Table: projects
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'هوية بصرية شاملة',
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" "ProjectStatus" NOT NULL DEFAULT 'BRIEFING',
    "progressPercentage" INTEGER NOT NULL DEFAULT 10,
    "currentStageIndex" INTEGER NOT NULL DEFAULT 0,
    "revisionsAllowed" INTEGER NOT NULL DEFAULT 3,
    "revisionsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Table: project_stages
CREATE TABLE "project_stages" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "requiresClientApproval" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,

    CONSTRAINT "project_stages_pkey" PRIMARY KEY ("id")
);

-- Table: proposals
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" "ProposalStatus" NOT NULL DEFAULT 'SENT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "terms" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- Table: proposal_items
CREATE TABLE "proposal_items" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "proposal_items_pkey" PRIMARY KEY ("id")
);

-- Table: invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "notes" TEXT,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Table: invoice_items
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- Table: invoice_payments
CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'تحويل بنكي',
    "transactionRef" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL DEFAULT 'النظام',

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- Table: agreements
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "signedAt" TIMESTAMP(3),
    "signedByName" TEXT,
    "clientIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- Table: brief_forms
CREATE TABLE "brief_forms" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "shareToken" TEXT NOT NULL,
    "completionRate" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brief_forms_pkey" PRIMARY KEY ("id")
);

-- Table: brief_questions
CREATE TABLE "brief_questions" (
    "id" TEXT NOT NULL,
    "briefFormId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "responseType" TEXT NOT NULL DEFAULT 'textarea',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "brief_questions_pkey" PRIMARY KEY ("id")
);

-- Table: brief_submissions
CREATE TABLE "brief_submissions" (
    "id" TEXT NOT NULL,
    "briefFormId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "submittedByEmail" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brief_submissions_pkey" PRIMARY KEY ("id")
);

-- Table: research_workspaces
CREATE TABLE "research_workspaces" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectSummary" TEXT NOT NULL,
    "marketContext" TEXT NOT NULL,
    "targetAudienceJson" JSONB NOT NULL,
    "competitorAnalysisJson" JSONB NOT NULL,
    "strategicPositioning" TEXT NOT NULL,
    "brandArchetype" TEXT NOT NULL,
    "toneOfVoiceJson" JSONB NOT NULL,
    "visualKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_workspaces_pkey" PRIMARY KEY ("id")
);

-- Table: moodboards
CREATE TABLE "moodboards" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "colorPaletteJson" JSONB NOT NULL,
    "typographyJson" JSONB NOT NULL,
    "isApprovedByClient" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "clientNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moodboards_pkey" PRIMARY KEY ("id")
);

-- Table: revision_requests
CREATE TABLE "revision_requests" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientFeedback" TEXT NOT NULL,
    "itemsRequested" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolvedDate" TIMESTAMP(3),
    "designerNotes" TEXT,

    CONSTRAINT "revision_requests_pkey" PRIMARY KEY ("id")
);

-- Table: deliverables
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DeliverableCategory" NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "fileSizeMb" DOUBLE PRECISION NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "isPublicForClient" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- Table: activity_logs
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "clientId" TEXT,
    "action" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL DEFAULT 'UPDATE',
    "description" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'النظام',
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");
CREATE UNIQUE INDEX "clients_portalAccessKey_key" ON "clients"("portalAccessKey");
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");
CREATE UNIQUE INDEX "proposals_proposalNumber_key" ON "proposals"("proposalNumber");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE UNIQUE INDEX "agreements_agreementNumber_key" ON "agreements"("agreementNumber");
CREATE UNIQUE INDEX "brief_forms_shareToken_key" ON "brief_forms"("shareToken");
CREATE UNIQUE INDEX "research_workspaces_projectId_key" ON "research_workspaces"("projectId");

-- Indexes
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "clients_status_idx" ON "clients"("status");
CREATE INDEX "projects_clientId_idx" ON "projects"("clientId");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_targetDate_idx" ON "projects"("targetDate");
CREATE INDEX "project_stages_projectId_order_idx" ON "project_stages"("projectId", "order");
CREATE INDEX "proposals_projectId_idx" ON "proposals"("projectId");
CREATE INDEX "proposals_clientId_idx" ON "proposals"("clientId");
CREATE INDEX "proposals_status_idx" ON "proposals"("status");
CREATE INDEX "invoices_projectId_idx" ON "invoices"("projectId");
CREATE INDEX "invoices_clientId_idx" ON "invoices"("clientId");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");
CREATE INDEX "agreements_projectId_idx" ON "agreements"("projectId");
CREATE INDEX "deliverables_projectId_category_idx" ON "deliverables"("projectId", "category");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- Foreign key constraints
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_stages" ADD CONSTRAINT "project_stages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_forms" ADD CONSTRAINT "brief_forms_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_forms" ADD CONSTRAINT "brief_forms_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_questions" ADD CONSTRAINT "brief_questions_briefFormId_fkey" FOREIGN KEY ("briefFormId") REFERENCES "brief_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_submissions" ADD CONSTRAINT "brief_submissions_briefFormId_fkey" FOREIGN KEY ("briefFormId") REFERENCES "brief_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brief_submissions" ADD CONSTRAINT "brief_submissions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_workspaces" ADD CONSTRAINT "research_workspaces_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moodboards" ADD CONSTRAINT "moodboards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
