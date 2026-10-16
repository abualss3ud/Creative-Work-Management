import fs from 'fs';
import path from 'path';
import {
  Client,
  Project,
  BriefForm,
  BriefSubmission,
  ResearchWorkspace,
  Proposal,
  Agreement,
  Invoice,
  Moodboard,
  RevisionRequest,
  Deliverable,
  ActivityLog,
  StudioSettings,
  DashboardMetrics,
  User,
  UserRole,
  RegisterInput,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_PROPOSALS,
  INITIAL_AGREEMENTS,
  INITIAL_INVOICES,
  INITIAL_BRIEF_FORMS,
  INITIAL_BRIEF_SUBMISSIONS,
  INITIAL_RESEARCH,
  INITIAL_MOODBOARDS,
  INITIAL_REVISIONS,
  INITIAL_DELIVERABLES,
  INITIAL_ACTIVITIES,
  INITIAL_STUDIO_SETTINGS,
  INITIAL_BRIEF_TEMPLATES,
} from '../services/mockData';

export interface UserRecord extends User {
  passwordHash: string;
}

export interface PasswordResetTokenRecord {
  email: string;
  token: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  settings: StudioSettings;
  clients: Client[];
  projects: Project[];
  proposals: Proposal[];
  agreements: Agreement[];
  invoices: Invoice[];
  briefForms: BriefForm[];
  briefSubmissions: BriefSubmission[];
  researchWorkspaces: ResearchWorkspace[];
  moodboards: Moodboard[];
  revisions: RevisionRequest[];
  deliverables: Deliverable[];
  activities: ActivityLog[];
  users: UserRecord[];
  resetTokens: PasswordResetTokenRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'brandflow_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'user_mohamed_abualsaud',
    email: 'abualss3ud@gmail.com',
    passwordHash: 'admin123',
    name: 'محمد أبو السعود',
    role: 'admin',
    title: 'مصمم واستراتيجي هويات بصرية مستقل | Independent Brand Identity Designer',
    avatarUrl: '/src/assets/images/designer_avatar_lead_1792158732035.jpg',
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'user_assistant_1',
    email: 'assistant@brandflow.studio',
    passwordHash: 'designer123',
    name: 'مساعد إنتاج الهوية (سارة)',
    role: 'member',
    title: 'مساعد تصميم وتطبيقات',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-02-15T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
  },
];

function getInitialData(): DatabaseSchema {
  return {
    settings: INITIAL_STUDIO_SETTINGS,
    clients: INITIAL_CLIENTS,
    projects: INITIAL_PROJECTS,
    proposals: INITIAL_PROPOSALS,
    agreements: INITIAL_AGREEMENTS,
    invoices: INITIAL_INVOICES,
    briefForms: INITIAL_BRIEF_FORMS,
    briefSubmissions: INITIAL_BRIEF_SUBMISSIONS,
    researchWorkspaces: [INITIAL_RESEARCH],
    moodboards: INITIAL_MOODBOARDS,
    revisions: INITIAL_REVISIONS,
    deliverables: INITIAL_DELIVERABLES,
    activities: INITIAL_ACTIVITIES,
    users: INITIAL_USERS,
    resetTokens: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure settings are synced to Mohamed Abu Al-Saud
        parsed.settings = {
          ...INITIAL_STUDIO_SETTINGS,
          ...parsed.settings,
          studioName: 'محمد أبو السعود | تصميم واستراتيجية الهويات البصرية',
          studioNameEn: 'Mohamed Abu Al-Saud — Brand Identity & Strategy',
          ownerName: 'محمد أبو السعود',
          email: 'abualss3ud@gmail.com',
          bankDetails: {
            ...INITIAL_STUDIO_SETTINGS.bankDetails,
            accountName: 'محمد أبو السعود (Mohamed Abu Al-Saud)',
          },
        };

        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        } else {
          // Ensure first admin user is Mohamed Abu Al-Saud
          parsed.users[0] = {
            ...parsed.users[0],
            name: 'محمد أبو السعود',
            email: 'abualss3ud@gmail.com',
            role: 'admin',
            title: 'مصمم واستراتيجي هويات بصرية مستقل | Independent Brand Identity Designer',
          };
        }
        if (!parsed.resetTokens) {
          parsed.resetTokens = [];
        }
        this.saveImmediate(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading DB file, falling back to seed data:', err);
    }
    const initial = getInitialData();
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  private persist(): void {
    this.saveImmediate(this.data);
  }

  // --- Settings ---
  getSettings(): StudioSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<StudioSettings>): StudioSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }

  // --- Clients ---
  getClients(): Client[] {
    return this.data.clients;
  }

  getClientById(id: string): Client | undefined {
    return this.data.clients.find((c) => c.id === id);
  }

  createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.clients.unshift(newClient);
    this.logActivity({
      action: 'إضافة عميل جديد',
      actionType: 'create',
      description: `تمت إضافة العميل "${newClient.name}" (${newClient.company || ''})`,
      clientId: newClient.id,
    });
    this.persist();
    return newClient;
  }

  updateClient(id: string, updates: Partial<Client>): Client | null {
    const idx = this.data.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.clients[idx] = {
      ...this.data.clients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.clients[idx];
  }

  deleteClient(id: string): { success: boolean; message: string } {
    // Safe deletion: prevent deleting if client has active projects
    const hasProjects = this.data.projects.some((p) => p.clientId === id && p.status !== 'closed');
    if (hasProjects) {
      // Archive instead of hard delete to preserve financial and project integrity
      const client = this.getClientById(id);
      if (client) {
        client.status = 'archived';
        client.updatedAt = new Date().toISOString();
        this.persist();
        return { success: true, message: 'تمت أرشفة العميل لحماية سجلات المشاريع والفواتير المرتبطة به.' };
      }
    }
    this.data.clients = this.data.clients.filter((c) => c.id !== id);
    this.persist();
    return { success: true, message: 'تم حذف العميل بنجاح.' };
  }

  // --- Projects ---
  getProjects(): Project[] {
    return this.data.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  createProject(projectData: Partial<Project>): Project {
    const id = `proj-${Date.now()}`;
    const stages = projectData.stages || INITIAL_PROJECTS[0].stages.map((s, idx) => ({
      ...s,
      id: `stage-${idx + 1}`,
      isCompleted: idx === 0,
      completedAt: idx === 0 ? new Date().toISOString() : undefined,
    }));

    const newProject: Project = {
      id,
      clientId: projectData.clientId || '',
      name: projectData.name || 'مشروع هوية بصرية جديد',
      serviceType: projectData.serviceType || 'هوية بصرية متكاملة',
      description: projectData.description || '',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      targetDate: projectData.targetDate || '',
      budget: Number(projectData.budget) || 0,
      currency: projectData.currency || this.data.settings.defaultCurrency,
      status: projectData.status || 'briefing',
      progressPercentage: 10,
      currentStageIndex: 0,
      stages,
      revisionsAllowed: projectData.revisionsAllowed || this.data.settings.defaultRevisionsCount,
      revisionsUsed: 0,
      invoiceIds: [],
      shareToken: `token-${id}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.projects.unshift(newProject);
    this.logActivity({
      action: 'إنشاء مشروع جديد',
      actionType: 'create',
      description: `تم إنشاء المشروع "${newProject.name}"`,
      projectId: newProject.id,
      clientId: newProject.clientId,
    });
    this.persist();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.projects[idx];
  }

  deleteProject(id: string): { success: boolean; message: string } {
    const proj = this.getProjectById(id);
    if (!proj) return { success: false, message: 'المشروع غير موجود' };

    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.logActivity({
      action: 'حذف مشروع',
      actionType: 'status_change',
      description: `تم حذف المشروع "${proj.name}"`,
    });
    this.persist();
    return { success: true, message: 'تم حذف المشروع بنجاح.' };
  }

  updateProjectStage(
    projectId: string,
    stageIndex: number,
    isCompleted: boolean
  ): Project | null {
    const project = this.getProjectById(projectId);
    if (!project || !project.stages[stageIndex]) return null;

    project.stages[stageIndex].isCompleted = isCompleted;
    project.stages[stageIndex].completedAt = isCompleted ? new Date().toISOString() : undefined;

    // Recalculate progress percentage
    const completedCount = project.stages.filter((s) => s.isCompleted).length;
    project.progressPercentage = Math.round((completedCount / project.stages.length) * 100);

    // Update current stage index to first incomplete stage or last
    const nextIncomplete = project.stages.findIndex((s) => !s.isCompleted);
    project.currentStageIndex = nextIncomplete !== -1 ? nextIncomplete : project.stages.length - 1;

    // Update project overall status based on progress
    if (project.progressPercentage === 100) {
      project.status = 'closed';
    } else if (project.currentStageIndex >= 10) {
      project.status = 'deliverables';
    } else if (project.currentStageIndex >= 9) {
      project.status = 'guidelines';
    } else if (project.currentStageIndex >= 8) {
      project.status = 'revisions';
    } else if (project.currentStageIndex >= 7) {
      project.status = 'client_review';
    } else if (project.currentStageIndex >= 5) {
      project.status = 'concept_design';
    } else if (project.currentStageIndex >= 4) {
      project.status = 'moodboard';
    } else if (project.currentStageIndex >= 2) {
      project.status = 'strategy';
    } else {
      project.status = 'briefing';
    }

    project.updatedAt = new Date().toISOString();
    this.logActivity({
      action: isCompleted ? 'إكمال مرحلة مشروع' : 'إعادة فتح مرحلة',
      actionType: 'status_change',
      description: `تم ${isCompleted ? 'إكمال' : 'إلغاء إكمال'} مرحلة "${project.stages[stageIndex].name}" في مشروع "${project.name}"`,
      projectId: project.id,
      clientId: project.clientId,
    });
    this.persist();
    return project;
  }

  // --- Proposals ---
  getProposals(): Proposal[] {
    return this.data.proposals;
  }

  getProposalById(id: string): Proposal | undefined {
    return this.data.proposals.find((p) => p.id === id);
  }

  getProposalByToken(token: string): Proposal | undefined {
    return this.data.proposals.find((p) => p.shareToken === token);
  }

  createProposal(data: Partial<Proposal>): Proposal {
    const id = `prop-${Date.now()}`;
    const count = this.data.proposals.length + 1;
    const quoteNumber = data.quoteNumber || `QUO-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    // Subtotal and tax calculations
    const items = data.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.total || item.unitPrice * item.quantity), 0);
    const discountAmount = data.discountAmount || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = data.taxRate ?? this.data.settings.defaultTaxRate;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    const newProposal: Proposal = {
      id,
      quoteNumber,
      clientId: data.clientId || '',
      projectId: data.projectId,
      title: data.title || 'عرض سعر هوية بصرية',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      expiryDate:
        data.expiryDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: data.currency || this.data.settings.defaultCurrency,
      items,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount,
      paymentSchedule: data.paymentSchedule || [
        {
          id: 'sched-1',
          milestoneTitle: 'عربون البدء (50%)',
          percentage: 50,
          amount: Math.round(totalAmount * 0.5),
          dueDateDescription: 'عند توقيع العقد',
        },
        {
          id: 'sched-2',
          milestoneTitle: 'الدفعة النهائية (50%)',
          percentage: 50,
          amount: totalAmount - Math.round(totalAmount * 0.5),
          dueDateDescription: 'قبل تسليم الملفات النهائية',
        },
      ],
      revisionsPolicy: data.revisionsPolicy || `يشمل العرض ${this.data.settings.defaultRevisionsCount} جولات تعديل.`,
      estimatedTimelineWeeks: data.estimatedTimelineWeeks || 6,
      terms: data.terms || this.data.settings.defaultPaymentTerms,
      status: data.status || 'draft',
      shareToken: `token-prop-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.proposals.unshift(newProposal);
    this.logActivity({
      action: 'إنشاء عرض سعر',
      actionType: 'create',
      description: `تم إنشاء عرض السعر رقم ${newProposal.quoteNumber} بقيمة ${newProposal.totalAmount} ${newProposal.currency}`,
      clientId: newProposal.clientId,
      projectId: newProposal.projectId,
    });
    this.persist();
    return newProposal;
  }

  updateProposal(id: string, updates: Partial<Proposal>): Proposal | null {
    const idx = this.data.proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.proposals[idx];
    const items = updates.items || existing.items;
    const subtotal = items.reduce((sum, item) => sum + (item.total || item.unitPrice * item.quantity), 0);
    const discountAmount = updates.discountAmount !== undefined ? updates.discountAmount : existing.discountAmount;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = updates.taxRate !== undefined ? updates.taxRate : existing.taxRate;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    this.data.proposals[idx] = {
      ...existing,
      ...updates,
      items,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount,
    };

    this.persist();
    return this.data.proposals[idx];
  }

  acceptProposal(id: string, signeeName: string): { proposal: Proposal; invoice?: Invoice; project?: Project } | null {
    const proposal = this.getProposalById(id);
    if (!proposal) return null;

    proposal.status = 'accepted';
    proposal.acceptedAt = new Date().toISOString();
    proposal.acceptedByName = signeeName;

    // Automatically convert or link to a project if one does not exist
    let project: Project | undefined;
    if (proposal.projectId) {
      project = this.getProjectById(proposal.projectId);
    } else {
      // Auto-create project from accepted proposal
      project = this.createProject({
        clientId: proposal.clientId,
        name: proposal.title,
        budget: proposal.totalAmount,
        currency: proposal.currency,
        proposalId: proposal.id,
      });
      proposal.projectId = project.id;
    }

    // Auto-create initial deposit invoice if requested by payment schedule
    let invoice: Invoice | undefined;
    const depositSchedule = proposal.paymentSchedule[0];
    if (depositSchedule && !depositSchedule.isInvoiceIssued) {
      invoice = this.createInvoice({
        clientId: proposal.clientId,
        projectId: proposal.projectId,
        proposalId: proposal.id,
        type: 'deposit',
        title: `فاتورة عربون - ${proposal.title}`,
        subtotal: depositSchedule.amount / (1 + proposal.taxRate / 100),
        taxRate: proposal.taxRate,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: proposal.currency,
        items: [
          {
            id: `item-${Date.now()}`,
            description: depositSchedule.milestoneTitle,
            amount: depositSchedule.amount / (1 + proposal.taxRate / 100),
          },
        ],
      });
      depositSchedule.isInvoiceIssued = true;
    }

    this.logActivity({
      action: 'اعتماد عرض السعر',
      actionType: 'approval',
      description: `تم اعتماد عرض السعر ${proposal.quoteNumber} بواسطة "${signeeName}"`,
      clientId: proposal.clientId,
      projectId: proposal.projectId,
    });
    this.persist();
    return { proposal, invoice, project };
  }

  // --- Invoices & Payments (Strict Financial Consistency) ---
  getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find((i) => i.id === id);
  }

  getInvoiceByToken(token: string): Invoice | undefined {
    return this.data.invoices.find((i) => i.shareToken === token);
  }

  createInvoice(data: Partial<Invoice>): Invoice {
    const id = `inv-${Date.now()}`;
    const count = this.data.invoices.length + 1;
    const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const items = data.items || [];
    const subtotal = data.subtotal || items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = data.taxRate ?? this.data.settings.defaultTaxRate;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const paidAmount = 0;
    const balanceDue = totalAmount;

    const newInvoice: Invoice = {
      id,
      invoiceNumber,
      clientId: data.clientId || '',
      projectId: data.projectId,
      proposalId: data.proposalId,
      type: data.type || 'custom',
      title: data.title || 'فاتورة خدمات تصميم',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: data.currency || this.data.settings.defaultCurrency,
      items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      paidAmount,
      balanceDue,
      status: 'issued',
      payments: [],
      notes: data.notes || '',
      paymentInstructions: data.paymentInstructions || `التحويل لحساب مؤسسة مدار للتصميم - آيبان ${this.data.settings.bankDetails.iban}`,
      shareToken: `token-inv-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.invoices.unshift(newInvoice);

    // If attached to project, update project's invoice list
    if (newInvoice.projectId) {
      const proj = this.getProjectById(newInvoice.projectId);
      if (proj && !proj.invoiceIds.includes(newInvoice.id)) {
        proj.invoiceIds.push(newInvoice.id);
      }
    }

    this.logActivity({
      action: 'إصدار فاتورة جديدة',
      actionType: 'create',
      description: `تم إصدار الفاتورة رقم ${newInvoice.invoiceNumber} بقيمة ${newInvoice.totalAmount} ${newInvoice.currency}`,
      clientId: newInvoice.clientId,
      projectId: newInvoice.projectId,
    });
    this.persist();
    return newInvoice;
  }

  recordPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentDate: string;
      paymentMethod: any;
      transactionReference: string;
      notes?: string;
    }
  ): { success: boolean; message: string; invoice?: Invoice } {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) {
      return { success: false, message: 'الفاتورة غير موجودة.' };
    }

    const payAmount = Number(paymentData.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return { success: false, message: 'مبلغ الدفعة يجب أن يكون أكبر من صفر.' };
    }

    // Check duplicate transaction reference
    const isDuplicate = invoice.payments.some(
      (p) => p.transactionReference && p.transactionReference === paymentData.transactionReference
    );
    if (isDuplicate) {
      return { success: false, message: 'رقم مرجع المعاملة مسجل مسبقاً لهذه الفاتورة، يُرجى التأكد من عدم تكرار الدفعة.' };
    }

    // Check overpayment (allow tolerance for minor floating point rounding)
    if (payAmount > invoice.balanceDue + 0.01) {
      return {
        success: false,
        message: `قيمة الدفعة (${payAmount} ${invoice.currency}) تتجاوز الرصيد المتبقي على الفاتورة (${invoice.balanceDue} ${invoice.currency}).`,
      };
    }

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId,
      amount: payAmount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod || 'bank_transfer',
      transactionReference: paymentData.transactionReference || `TX-${Date.now()}`,
      notes: paymentData.notes || '',
      recordedAt: new Date().toISOString(),
    };

    invoice.payments.push(paymentRecord);

    // Recalculate accurately
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.paidAmount = Math.round(totalPaid * 100) / 100;
    invoice.balanceDue = Math.max(0, Math.round((invoice.totalAmount - invoice.paidAmount) * 100) / 100);

    if (invoice.balanceDue <= 0.01) {
      invoice.status = 'paid';
      invoice.balanceDue = 0;
    } else {
      invoice.status = 'partially_paid';
    }

    this.logActivity({
      action: 'تسجيل دفعة مالية',
      actionType: 'payment',
      description: `تم تسجيل دفعة بقيمة ${payAmount} ${invoice.currency} على الفاتورة ${invoice.invoiceNumber}. المتبقي: ${invoice.balanceDue} ${invoice.currency}`,
      clientId: invoice.clientId,
      projectId: invoice.projectId,
    });
    this.persist();
    return { success: true, message: 'تم تسجيل الدفعة بنجاح وتحديث رصيد الفاتورة.', invoice };
  }

  // --- Agreements ---
  getAgreements(): Agreement[] {
    return this.data.agreements;
  }

  getAgreementById(id: string): Agreement | undefined {
    return this.data.agreements.find((a) => a.id === id);
  }

  createAgreement(data: Partial<Agreement>): Agreement {
    const id = `agr-${Date.now()}`;
    const count = this.data.agreements.length + 1;
    const agreementNumber = data.agreementNumber || `AGR-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newAgreement: Agreement = {
      id,
      agreementNumber,
      proposalId: data.proposalId,
      clientId: data.clientId || '',
      projectId: data.projectId || '',
      title: data.title || 'اتفاقية تقديم خدمات تصميم الهوية البصرية',
      scopeOfWork: data.scopeOfWork || '',
      deliverablesList: data.deliverablesList || [],
      timeline: data.timeline || '6 أسابيع من تاريخ التعاقد وسداد الدفعة الأولى',
      compensationTerms: data.compensationTerms || '',
      paymentMilestones: data.paymentMilestones || '',
      revisionsAndAlterations: data.revisionsAndAlterations || `يشمل العمل ${this.data.settings.defaultRevisionsCount} جولات تعديل.`,
      approvalMechanism: data.approvalMechanism || 'يتم اعتماد المراحل كتابياً عبر بوابة العميل أو البريد الإلكتروني المعتمد.',
      cancellationAndPostponement: data.cancellationAndPostponement || 'في حال الإلغاء، لا يسترد العربون وتُحسب تكاليف المراحل المنجزة.',
      intellectualPropertyRights: data.intellectualPropertyRights || 'تنتقل ملكية الهوية للعميل فور سداد كامل الأتعاب مع احتفاظ الاستوديو بحق النشر التوثيقي.',
      status: data.status || 'draft',
      shareToken: `token-agr-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.agreements.unshift(newAgreement);
    this.logActivity({
      action: 'إنشاء اتفاقية جديدة',
      actionType: 'create',
      description: `تم إنشاء الاتفاقية رقم ${newAgreement.agreementNumber}`,
      clientId: newAgreement.clientId,
      projectId: newAgreement.projectId,
    });
    this.persist();
    return newAgreement;
  }

  signAgreement(id: string, signeeName: string): Agreement | null {
    const agreement = this.getAgreementById(id);
    if (!agreement) return null;
    agreement.status = 'signed';
    agreement.signedAt = new Date().toISOString();
    agreement.signeeName = signeeName;
    this.logActivity({
      action: 'توقيع الاتفاقية',
      actionType: 'approval',
      description: `تم توقيع الاتفاقية ${agreement.agreementNumber} بواسطة "${signeeName}"`,
      clientId: agreement.clientId,
      projectId: agreement.projectId,
    });
    this.persist();
    return agreement;
  }

  // --- Brief Forms & Submissions ---
  getBriefForms(): BriefForm[] {
    return this.data.briefForms;
  }

  getBriefFormById(id: string): BriefForm | undefined {
    return this.data.briefForms.find((f) => f.id === id);
  }

  getBriefFormByToken(token: string): BriefForm | undefined {
    return this.data.briefForms.find((f) => f.shareToken === token);
  }

  createBriefForm(data: Partial<BriefForm>): BriefForm {
    const id = `brief-${Date.now()}`;
    const newForm: BriefForm = {
      id,
      projectId: data.projectId,
      clientId: data.clientId,
      title: data.title || 'نموذج بريف هوية بصرية جديد',
      description: data.description || 'يُرجى تعبئة الحقول التالية بدقة لتزويدنا بكافة تفاصيل العلامة.',
      questions: data.questions || INITIAL_BRIEF_TEMPLATES[0].questions,
      status: 'sent',
      shareToken: `brief-token-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.briefForms.unshift(newForm);
    this.persist();
    return newForm;
  }

  getBriefSubmissions(): BriefSubmission[] {
    return this.data.briefSubmissions;
  }

  getBriefSubmissionById(id: string): BriefSubmission | undefined {
    return this.data.briefSubmissions.find((s) => s.id === id);
  }

  submitBriefAnswers(
    formId: string,
    answers: Record<string, any>,
    clientName: string,
    clientEmail: string,
    clientCompany?: string
  ): BriefSubmission | null {
    const form = this.getBriefFormById(formId);
    if (!form) return null;

    const subId = `sub-${Date.now()}`;
    const submission: BriefSubmission = {
      id: subId,
      formId,
      projectId: form.projectId,
      clientId: form.clientId,
      answers,
      clientName,
      clientEmail,
      clientCompany,
      submittedAt: new Date().toISOString(),
      isDraft: false,
    };

    this.data.briefSubmissions.unshift(submission);
    form.status = 'completed';
    form.submissionId = subId;
    form.updatedAt = new Date().toISOString();

    // If attached to a project, update project brief stage
    if (form.projectId) {
      const proj = this.getProjectById(form.projectId);
      if (proj) {
        proj.briefFormId = form.id;
        proj.briefSubmissionId = subId;
        // mark stage 2 (brief collection) as completed
        if (proj.stages[1]) {
          proj.stages[1].isCompleted = true;
          proj.stages[1].completedAt = new Date().toISOString();
        }
      }
    }

    this.logActivity({
      action: 'استلام بريف العميل',
      actionType: 'create',
      description: `قام العميل "${clientName}" بتعبئة وإرسال إجابات نموذج البريف "${form.title}"`,
      clientId: form.clientId,
      projectId: form.projectId,
    });
    this.persist();
    return submission;
  }

  // --- Research & Strategy ---
  getResearchByProjectId(projectId: string): ResearchWorkspace | undefined {
    return this.data.researchWorkspaces.find((r) => r.projectId === projectId);
  }

  saveResearch(projectId: string, data: Partial<ResearchWorkspace>): ResearchWorkspace {
    let research = this.getResearchByProjectId(projectId);
    if (research) {
      Object.assign(research, data);
      research.updatedAt = new Date().toISOString();
    } else {
      research = {
        id: `research-${projectId}`,
        projectId,
        executiveSummary: data.executiveSummary || '',
        researchGoals: data.researchGoals || [],
        marketOverview: data.marketOverview || '',
        targetAudience: data.targetAudience || {
          demographics: '',
          psychographics: '',
          painPoints: [],
          buyingBehavior: '',
          expectations: '',
        },
        competitors: data.competitors || [],
        visualPatterns: data.visualPatterns || {
          clichesToAvoid: [],
          commonColors: [],
          emergingAesthetics: [],
          symbolisms: [],
          materialsAndPackaging: '',
        },
        brandNameAnalysis: data.brandNameAnalysis || {
          etymology: '',
          linguisticOrigin: '',
          mentalAssociations: [],
          visualOpportunities: [],
          risksOrMisinterpretations: [],
        },
        strategicOpportunities: data.strategicOpportunities || {
          marketGaps: [],
          differentiationPoints: [],
          visualStrategyDo: [],
          visualStrategyAvoid: [],
          keyDecisionsToValidate: [],
        },
        sources: data.sources || [],
        updatedAt: new Date().toISOString(),
      };
      this.data.researchWorkspaces.push(research);
    }
    this.persist();
    return research;
  }

  // --- Moodboard ---
  getMoodboardByProjectId(projectId: string): Moodboard | undefined {
    return this.data.moodboards.find((m) => m.projectId === projectId);
  }

  saveMoodboard(projectId: string, data: Partial<Moodboard>): Moodboard {
    let mb = this.getMoodboardByProjectId(projectId);
    if (mb) {
      Object.assign(mb, data);
      mb.updatedAt = new Date().toISOString();
    } else {
      mb = {
        id: `mb-${projectId}`,
        projectId,
        title: data.title || 'لوحة الاتجاهات البصرية',
        directions: data.directions || [],
        clientNotes: data.clientNotes,
        approvedDirectionId: data.approvedDirectionId,
        updatedAt: new Date().toISOString(),
      };
      this.data.moodboards.push(mb);
    }
    this.persist();
    return mb;
  }

  approveMoodboardDirection(projectId: string, directionId: string, notes?: string): Moodboard | null {
    const mb = this.getMoodboardByProjectId(projectId);
    if (!mb) return null;
    mb.approvedDirectionId = directionId;
    if (notes) mb.clientNotes = notes;
    mb.directions.forEach((d) => {
      d.isClientApproved = d.id === directionId;
    });
    mb.updatedAt = new Date().toISOString();

    const proj = this.getProjectById(projectId);
    if (proj && proj.stages[4]) {
      proj.stages[4].isCompleted = true;
      proj.stages[4].completedAt = new Date().toISOString();
    }

    this.logActivity({
      action: 'اعتماد اتجاه المودبورد',
      actionType: 'approval',
      description: `تم اعتماد الاتجاه البصري "${mb.directions.find((d) => d.id === directionId)?.name || ''}" في لوحة المودبورد`,
      projectId,
    });
    this.persist();
    return mb;
  }

  // --- Revisions ---
  getRevisionsByProjectId(projectId: string): RevisionRequest[] {
    return this.data.revisions.filter((r) => r.projectId === projectId);
  }

  createRevision(data: Partial<RevisionRequest>): RevisionRequest {
    const id = `rev-${Date.now()}`;
    const existing = this.getRevisionsByProjectId(data.projectId || '');
    const roundNumber = existing.length + 1;

    const newRev: RevisionRequest = {
      id,
      projectId: data.projectId || '',
      roundNumber,
      requestDate: new Date().toISOString().split('T')[0],
      clientFeedback: data.clientFeedback || '',
      itemsRequested: data.itemsRequested || [],
      status: 'pending',
      designerNotes: data.designerNotes,
    };

    this.data.revisions.unshift(newRev);

    // Update project revisions count
    const proj = this.getProjectById(data.projectId || '');
    if (proj) {
      proj.revisionsUsed = roundNumber;
    }

    this.logActivity({
      action: 'تسجيل طلب تعديل',
      actionType: 'update',
      description: `تم تسجيل جولة التعديل رقم ${roundNumber} للمشروع "${proj?.name || ''}"`,
      projectId: data.projectId,
    });
    this.persist();
    return newRev;
  }

  // --- Deliverables ---
  getDeliverablesByProjectId(projectId: string): Deliverable[] {
    return this.data.deliverables.filter((d) => d.projectId === projectId);
  }

  createDeliverable(data: Partial<Deliverable>): Deliverable {
    const id = `del-${Date.now()}`;
    const newDel: Deliverable = {
      id,
      projectId: data.projectId || '',
      title: data.title || 'ملف تسليم جديد',
      category: data.category || 'logo_vectors',
      fileFormat: data.fileFormat || 'ZIP',
      fileSizeMb: data.fileSizeMb || 10,
      downloadUrl: data.downloadUrl || '#',
      isPublicForClient: data.isPublicForClient !== undefined ? data.isPublicForClient : true,
      notes: data.notes,
      uploadedAt: new Date().toISOString(),
    };
    this.data.deliverables.unshift(newDel);
    this.logActivity({
      action: 'رفع ملف تسليم',
      actionType: 'delivery',
      description: `تم إدراج ملف التسليم "${newDel.title}" (${newDel.fileFormat})`,
      projectId: newDel.projectId,
    });
    this.persist();
    return newDel;
  }

  // --- Activity Logging ---
  private logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp' | 'actor'> & { actor?: string }): void {
    const act: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: entry.actor || this.data.settings.ownerName || 'المصمم',
      ...entry,
    };
    this.data.activities.unshift(act);
    if (this.data.activities.length > 100) {
      this.data.activities.pop();
    }
  }

  getActivities(limit: number = 20): ActivityLog[] {
    return this.data.activities.slice(0, limit);
  }

  // --- Aggregated Real Dashboard Metrics ---
  getDashboardMetrics(): DashboardMetrics {
    const activeProjects = this.data.projects.filter((p) => p.status !== 'closed');
    const leads = this.data.clients.filter((c) => c.status === 'lead' || c.status === 'contacted' || c.status === 'negotiating');
    const pendingProposals = this.data.proposals.filter((p) => p.status === 'sent' || p.status === 'viewed');
    const unpaidInvoices = this.data.invoices.filter((i) => i.status === 'issued' || i.status === 'partially_paid' || i.status === 'overdue');

    const totalReceivables = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    // Sum all paid payments from invoices
    let totalRevenueYear = 0;
    this.data.invoices.forEach((inv) => {
      inv.payments.forEach((p) => {
        totalRevenueYear += p.amount;
      });
    });

    const now = new Date();
    const upcomingDeadlines = activeProjects
      .filter((p) => p.targetDate)
      .map((p) => {
        const client = this.getClientById(p.clientId);
        const target = new Date(p.targetDate);
        const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const currentStage = p.stages[p.currentStageIndex]?.name || 'غير محدد';
        return {
          id: p.id,
          projectName: p.name,
          clientName: client?.name || client?.company || 'عميل',
          targetDate: p.targetDate,
          daysRemaining: diffDays,
          stageName: currentStage,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);

    const projectsNeedingAction = activeProjects
      .filter((p) => {
        const currentStage = p.stages[p.currentStageIndex];
        return currentStage && currentStage.requiresClientApproval;
      })
      .map((p) => {
        const client = this.getClientById(p.clientId);
        return {
          id: p.id,
          name: p.name,
          clientName: client?.company || client?.name || 'عميل',
          reason: `بانتظار موافقة العميل على مرحلة "${p.stages[p.currentStageIndex].name}"`,
          stage: p.stages[p.currentStageIndex].name,
        };
      });

    return {
      activeProjectsCount: activeProjects.length,
      leadsCount: leads.length,
      pendingProposalsCount: pendingProposals.length,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalReceivables,
      totalRevenueYear,
      upcomingDeadlines,
      projectsNeedingAction,
      recentActivities: this.getActivities(8),
    };
  }

  // --- Secure Client Portal Data Bundler ---
  getClientPortalData(token: string) {
    const project = this.data.projects.find((p) => p.shareToken === token);
    if (!project) return null;

    const client = this.getClientById(project.clientId);
    const briefForm = project.briefFormId ? this.getBriefFormById(project.briefFormId) : undefined;
    const briefSubmission = project.briefSubmissionId ? this.getBriefSubmissionById(project.briefSubmissionId) : undefined;
    const proposal = project.proposalId ? this.getProposalById(project.proposalId) : undefined;
    const agreement = project.agreementId ? this.getAgreementById(project.agreementId) : undefined;
    const invoices = this.data.invoices.filter((i) => project.invoiceIds.includes(i.id));
    const moodboard = this.getMoodboardByProjectId(project.id);
    const revisions = this.getRevisionsByProjectId(project.id);
    const deliverables = this.getDeliverablesByProjectId(project.id).filter((d) => d.isPublicForClient);

    return {
      studio: {
        name: this.data.settings.studioName,
        email: this.data.settings.email,
        phone: this.data.settings.phone,
        bankDetails: this.data.settings.bankDetails,
      },
      client: client
        ? {
            name: client.name,
            company: client.company,
            email: client.email,
          }
        : null,
      project: {
        id: project.id,
        name: project.name,
        serviceType: project.serviceType,
        description: project.description,
        status: project.status,
        progressPercentage: project.progressPercentage,
        currentStageIndex: project.currentStageIndex,
        stages: project.stages,
        targetDate: project.targetDate,
      },
      brief: {
        form: briefForm,
        submission: briefSubmission,
      },
      proposal,
      agreement,
      invoices,
      moodboard,
      revisions,
      deliverables,
    };
  }

  // --- Authentication & User Management ---
  authenticateUser(email: string, passwordPlain: string): User | null {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (user.passwordHash !== passwordPlain) {
      return null;
    }
    user.lastLoginAt = new Date().toISOString();
    this.persist();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  registerUser(input: RegisterInput): User {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      throw new Error('البريد الإلكتروني مسجل مسبقًا في النظام');
    }

    const newUser: UserRecord = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      passwordHash: input.password,
      role: input.role || 'member',
      title: input.title || (input.role === 'admin' ? 'مدير الاستوديو' : 'مصممة هويات بصرية'),
      avatarUrl: '/src/assets/images/designer_avatar_lead_1792158732035.jpg',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.data.activities.unshift({
      id: `act_${Date.now()}`,
      action: 'انضمام عضو جديد',
      actionType: 'create',
      description: `تم تسجيل حساب جديد للمستخدم ${newUser.name} بصلاحية ${newUser.role === 'admin' ? 'مدير استوديو' : 'عضو استوديو'}`,
      actor: newUser.name,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  createPasswordResetToken(email: string): { email: string; token: string; expiresAt: string } | null {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const token = `rst_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    this.data.resetTokens = this.data.resetTokens.filter((r) => r.email.toLowerCase() !== email.toLowerCase());
    this.data.resetTokens.push({ email: user.email, token, expiresAt });
    this.persist();

    return { email: user.email, token, expiresAt };
  }

  resetPasswordWithToken(token: string, newPassword: string): boolean {
    const record = this.data.resetTokens.find((r) => r.token === token);
    if (!record) return false;
    if (new Date(record.expiresAt) < new Date()) {
      return false; // token expired
    }

    const user = this.data.users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) return false;

    user.passwordHash = newPassword;
    this.data.resetTokens = this.data.resetTokens.filter((r) => r.token !== token);
    this.data.activities.unshift({
      id: `act_${Date.now()}`,
      action: 'تغيير كلمة المرور',
      actionType: 'update',
      description: `تمت استعادة وتعيين كلمة المرور لحساب ${user.name}`,
      actor: user.name,
      timestamp: new Date().toISOString(),
    });
    this.persist();
    return true;
  }

  getUserById(id: string): User | null {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...u }) => u);
  }

  updateUserRole(userId: string, newRole: UserRole): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.role = newRole;
    this.persist();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  deleteInvoice(id: string): { success: boolean; message: string } {
    this.data.invoices = this.data.invoices.filter((i) => i.id !== id);
    this.persist();
    return { success: true, message: 'تم حذف الفاتورة بنجاح.' };
  }

  deleteProposal(id: string): { success: boolean; message: string } {
    this.data.proposals = this.data.proposals.filter((p) => p.id !== id);
    this.persist();
    return { success: true, message: 'تم حذف عرض السعر بنجاح.' };
  }

  deleteAgreement(id: string): { success: boolean; message: string } {
    this.data.agreements = this.data.agreements.filter((a) => a.id !== id);
    this.persist();
    return { success: true, message: 'تم حذف الاتفاقية بنجاح.' };
  }

  deleteBriefForm(id: string): { success: boolean; message: string } {
    this.data.briefForms = this.data.briefForms.filter((f) => f.id !== id);
    this.data.briefSubmissions = this.data.briefSubmissions.filter((s) => s.formId !== id);
    this.persist();
    return { success: true, message: 'تم حذف نموذج البريف بنجاح.' };
  }
}

export const db = new Database();
