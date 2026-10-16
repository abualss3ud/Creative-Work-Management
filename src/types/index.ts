/**
 * BrandFlow Type Definitions
 * Complete domain models for Brand Identity Studio Management Platform
 */

export type Language = 'ar' | 'en';

export type ClientStatus = 'lead' | 'contacted' | 'negotiating' | 'active' | 'archived';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  source: string;
  status: ClientStatus;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'briefing'
  | 'strategy'
  | 'moodboard'
  | 'concept_design'
  | 'client_review'
  | 'revisions'
  | 'guidelines'
  | 'deliverables'
  | 'closed';

export interface ProjectStage {
  id: string;
  name: string;
  nameEn: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string;
  requiresClientApproval?: boolean;
  description: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  serviceType: string;
  description: string;
  startDate: string;
  targetDate: string;
  budget: number;
  currency: string;
  status: ProjectStatus;
  progressPercentage: number;
  currentStageIndex: number;
  stages: ProjectStage[];
  revisionsAllowed: number;
  revisionsUsed: number;
  proposalId?: string;
  agreementId?: string;
  invoiceIds: string[];
  briefFormId?: string;
  briefSubmissionId?: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'select'
  | 'date'
  | 'budget_range'
  | 'url'
  | 'file_upload';

export interface BriefQuestion {
  id: string;
  section: string;
  sectionEn: string;
  title: string;
  titleEn: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface BriefTemplate {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  category: string;
  questions: BriefQuestion[];
  isDefault?: boolean;
}

export interface BriefForm {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description: string;
  questions: BriefQuestion[];
  status: 'draft' | 'sent' | 'in_progress' | 'completed';
  shareToken: string;
  submissionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BriefSubmission {
  id: string;
  formId: string;
  projectId?: string;
  clientId?: string;
  answers: Record<string, any>;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  submittedAt: string;
  isDraft: boolean;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  socials?: string;
  positioning: string;
  logoAnalysis: string;
  primaryColors: string[];
  typography: string;
  packagingStyle: string;
  toneOfVoice: string;
  strengths: string[];
  weaknesses: string[];
  referenceImageUrl?: string;
  sourceDate: string;
  sourceNote?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'report' | 'visual_reference' | 'field_study';
  notes: string;
  dateAccessed: string;
}

export interface ResearchWorkspace {
  id: string;
  projectId: string;
  executiveSummary: string;
  researchGoals: string[];
  marketOverview: string;
  targetAudience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
    buyingBehavior: string;
    expectations: string;
  };
  competitors: Competitor[];
  visualPatterns: {
    clichesToAvoid: string[];
    commonColors: string[];
    emergingAesthetics: string[];
    symbolisms: string[];
    materialsAndPackaging: string;
  };
  brandNameAnalysis: {
    etymology: string;
    linguisticOrigin: string;
    mentalAssociations: string[];
    visualOpportunities: string[];
    risksOrMisinterpretations: string[];
  };
  strategicOpportunities: {
    marketGaps: string[];
    differentiationPoints: string[];
    visualStrategyDo: string[];
    visualStrategyAvoid: string[];
    keyDecisionsToValidate: string[];
  };
  sources: ResearchSource[];
  updatedAt: string;
}

export interface ProposalItem {
  id: string;
  serviceName: string;
  description: string;
  deliverablesSummary: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentScheduleItem {
  id: string;
  milestoneTitle: string;
  percentage: number;
  amount: number;
  dueDateDescription: string;
  isInvoiceIssued?: boolean;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface Proposal {
  id: string;
  quoteNumber: string;
  clientId: string;
  projectId?: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  currency: string;
  items: ProposalItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number; // e.g. 15 for 15% VAT
  taxAmount: number;
  totalAmount: number;
  paymentSchedule: PaymentScheduleItem[];
  revisionsPolicy: string;
  estimatedTimelineWeeks: number;
  terms: string;
  status: ProposalStatus;
  shareToken: string;
  acceptedAt?: string;
  acceptedByName?: string;
  createdAt: string;
}

export type AgreementStatus = 'draft' | 'sent' | 'signed' | 'external_uploaded';

export interface Agreement {
  id: string;
  agreementNumber: string;
  proposalId?: string;
  clientId: string;
  projectId: string;
  title: string;
  scopeOfWork: string;
  deliverablesList: string[];
  timeline: string;
  compensationTerms: string;
  paymentMilestones: string;
  revisionsAndAlterations: string;
  approvalMechanism: string;
  cancellationAndPostponement: string;
  intellectualPropertyRights: string;
  status: AgreementStatus;
  signedAt?: string;
  signeeName?: string;
  externalDocUrl?: string;
  shareToken: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'stc_pay' | 'cash' | 'other';
  transactionReference: string;
  notes?: string;
  recordedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  proposalId?: string;
  type: 'deposit' | 'milestone' | 'final' | 'custom';
  title: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  notes?: string;
  paymentInstructions: string;
  shareToken: string;
  createdAt: string;
}

export interface MoodboardAsset {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl?: string;
  tags: string[];
  notes?: string;
  category: 'typography' | 'color' | 'composition' | 'photography' | 'packaging' | 'stationery';
}

export interface MoodboardDirection {
  id: string;
  name: string;
  description: string;
  assets: MoodboardAsset[];
  colorPalette: string[];
  isClientApproved?: boolean;
}

export interface Moodboard {
  id: string;
  projectId: string;
  title: string;
  directions: MoodboardDirection[];
  clientNotes?: string;
  approvedDirectionId?: string;
  updatedAt: string;
}

export interface RevisionRequest {
  id: string;
  projectId: string;
  roundNumber: number;
  requestDate: string;
  clientFeedback: string;
  itemsRequested: string[];
  status: 'pending' | 'in_progress' | 'completed';
  resolvedDate?: string;
  designerNotes?: string;
}

export type DeliverableCategory =
  | 'logo_vectors'
  | 'brand_guidelines'
  | 'stationery'
  | 'social_templates'
  | 'packaging'
  | 'typography_fonts'
  | 'source_files';

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  category: DeliverableCategory;
  fileFormat: string; // SVG, AI, EPS, PDF, PNG, ZIP
  fileSizeMb: number;
  downloadUrl: string;
  isPublicForClient: boolean;
  notes?: string;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  clientId?: string;
  action: string;
  actionType: 'create' | 'update' | 'approval' | 'payment' | 'delivery' | 'status_change';
  description: string;
  timestamp: string;
  actor: string;
}

export interface StudioSettings {
  studioName: string;
  studioNameEn: string;
  tagline: string;
  taglineEn: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string; // الرقم الضريبي
  crNumber: string; // السجل التجاري
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultRevisionsCount: number;
  defaultPaymentTerms: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    iban: string;
    swift?: string;
  };
  language: Language;
}

export interface DashboardMetrics {
  activeProjectsCount: number;
  leadsCount: number;
  pendingProposalsCount: number;
  unpaidInvoicesCount: number;
  totalReceivables: number;
  totalRevenueYear: number;
  upcomingDeadlines: Array<{
    id: string;
    projectName: string;
    clientName: string;
    targetDate: string;
    daysRemaining: number;
    stageName: string;
  }>;
  projectsNeedingAction: Array<{
    id: string;
    name: string;
    clientName: string;
    reason: string;
    stage: string;
  }>;
  recentActivities: ActivityLog[];
}

export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}
