import {
  Client,
  Project,
  Proposal,
  Invoice,
  Agreement,
  BriefForm,
  BriefSubmission,
  ResearchWorkspace,
  Moodboard,
  RevisionRequest,
  Deliverable,
  ActivityLog,
  StudioSettings,
  DashboardMetrics,
  User,
  UserRole,
  AuthSession,
  RegisterInput,
} from '../types';

const API_BASE = '/api';
let currentAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  currentAuthToken = token;
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error || errJson.message) {
        errorMsg = errJson.error || errJson.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Stats
  async getStats(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<DashboardMetrics>(res);
  },

  // Settings
  async getSettings(): Promise<StudioSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<StudioSettings>(res);
  },
  async updateSettings(settings: Partial<StudioSettings>): Promise<StudioSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse<StudioSettings>(res);
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    return handleResponse<Client[]>(res);
  },
  async createClient(client: Partial<Client>): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    return handleResponse<Client>(res);
  },
  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Client>(res);
  },
  async deleteClient(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return handleResponse<Project[]>(res);
  },
  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse<Project>(res);
  },
  async createProject(project: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return handleResponse<Project>(res);
  },
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Project>(res);
  },
  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
  async updateProjectStage(id: string, stageIndex: number, isCompleted: boolean): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageIndex, isCompleted }),
    });
    return handleResponse<Project>(res);
  },

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    const res = await fetch(`${API_BASE}/proposals`);
    return handleResponse<Proposal[]>(res);
  },
  async createProposal(proposal: Partial<Proposal>): Promise<Proposal> {
    const res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal),
    });
    return handleResponse<Proposal>(res);
  },
  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal> {
    const res = await fetch(`${API_BASE}/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Proposal>(res);
  },
  async deleteProposal(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/proposals/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
  async acceptProposal(id: string, signeeName: string): Promise<{ proposal: Proposal; invoice?: Invoice; project?: Project }> {
    const res = await fetch(`${API_BASE}/proposals/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signeeName }),
    });
    return handleResponse<{ proposal: Proposal; invoice?: Invoice; project?: Project }>(res);
  },
  async getProposalByToken(token: string): Promise<{ proposal: Proposal; client?: Client; studio: StudioSettings }> {
    const res = await fetch(`${API_BASE}/proposals/token/${token}`);
    return handleResponse<{ proposal: Proposal; client?: Client; studio: StudioSettings }>(res);
  },

  // Invoices & Payments
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE}/invoices`);
    return handleResponse<Invoice[]>(res);
  },
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    return handleResponse<Invoice>(res);
  },
  async recordPayment(
    invoiceId: string,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: any;
      transactionReference: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; invoice?: Invoice }> {
    const res = await fetch(`${API_BASE}/invoices/${invoiceId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return handleResponse<{ success: boolean; message: string; invoice?: Invoice }>(res);
  },
  async getInvoiceByToken(token: string): Promise<{ invoice: Invoice; client?: Client; studio: StudioSettings }> {
    const res = await fetch(`${API_BASE}/invoices/token/${token}`);
    return handleResponse<{ invoice: Invoice; client?: Client; studio: StudioSettings }>(res);
  },
  async deleteInvoice(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Agreements
  async getAgreements(): Promise<Agreement[]> {
    const res = await fetch(`${API_BASE}/agreements`);
    return handleResponse<Agreement[]>(res);
  },
  async createAgreement(agreement: Partial<Agreement>): Promise<Agreement> {
    const res = await fetch(`${API_BASE}/agreements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agreement),
    });
    return handleResponse<Agreement>(res);
  },
  async signAgreement(id: string, signeeName: string): Promise<Agreement> {
    const res = await fetch(`${API_BASE}/agreements/${id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signeeName }),
    });
    return handleResponse<Agreement>(res);
  },
  async deleteAgreement(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/agreements/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Brief Forms
  async getBriefForms(): Promise<BriefForm[]> {
    const res = await fetch(`${API_BASE}/brief-forms`);
    return handleResponse<BriefForm[]>(res);
  },
  async getBriefFormByToken(token: string): Promise<{ form: BriefForm; studio: StudioSettings; submission?: BriefSubmission | null }> {
    const res = await fetch(`${API_BASE}/brief-forms/token/${token}`);
    return handleResponse<{ form: BriefForm; studio: StudioSettings; submission?: BriefSubmission | null }>(res);
  },
  async createBriefForm(form: Partial<BriefForm>): Promise<BriefForm> {
    const res = await fetch(`${API_BASE}/brief-forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    return handleResponse<BriefForm>(res);
  },
  async deleteBriefForm(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/brief-forms/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
  async submitBrief(
    formId: string,
    payload: { answers: Record<string, any>; clientName: string; clientEmail: string; clientCompany?: string }
  ): Promise<BriefSubmission> {
    const res = await fetch(`${API_BASE}/brief-forms/${formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<BriefSubmission>(res);
  },
  async getBriefSubmissions(): Promise<BriefSubmission[]> {
    const res = await fetch(`${API_BASE}/brief-submissions`);
    return handleResponse<BriefSubmission[]>(res);
  },

  // Research Workspace & PDF Data
  async getResearch(projectId: string): Promise<ResearchWorkspace> {
    const res = await fetch(`${API_BASE}/research/${projectId}`);
    return handleResponse<ResearchWorkspace>(res);
  },
  async saveResearch(projectId: string, research: Partial<ResearchWorkspace>): Promise<ResearchWorkspace> {
    const res = await fetch(`${API_BASE}/research/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(research),
    });
    return handleResponse<ResearchWorkspace>(res);
  },

  // Moodboard
  async getMoodboard(projectId: string): Promise<Moodboard | null> {
    const res = await fetch(`${API_BASE}/moodboard/${projectId}`);
    return handleResponse<Moodboard | null>(res);
  },
  async saveMoodboard(projectId: string, moodboard: Partial<Moodboard>): Promise<Moodboard> {
    const res = await fetch(`${API_BASE}/moodboard/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moodboard),
    });
    return handleResponse<Moodboard>(res);
  },
  async approveMoodboard(projectId: string, directionId: string, notes?: string): Promise<Moodboard> {
    const res = await fetch(`${API_BASE}/moodboard/${projectId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directionId, notes }),
    });
    return handleResponse<Moodboard>(res);
  },

  // Revisions
  async getRevisions(projectId: string): Promise<RevisionRequest[]> {
    const res = await fetch(`${API_BASE}/revisions/${projectId}`);
    return handleResponse<RevisionRequest[]>(res);
  },
  async createRevision(projectId: string, data: Partial<RevisionRequest>): Promise<RevisionRequest> {
    const res = await fetch(`${API_BASE}/revisions/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<RevisionRequest>(res);
  },

  // Deliverables
  async getDeliverables(projectId: string): Promise<Deliverable[]> {
    const res = await fetch(`${API_BASE}/deliverables/${projectId}`);
    return handleResponse<Deliverable[]>(res);
  },
  async createDeliverable(projectId: string, data: Partial<Deliverable>): Promise<Deliverable> {
    const res = await fetch(`${API_BASE}/deliverables/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Deliverable>(res);
  },

  // Activities
  async getActivities(): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE}/activities`);
    return handleResponse<ActivityLog[]>(res);
  },

  // Client Portal Data
  async getPortalData(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/portal/${token}`);
    return handleResponse<any>(res);
  },

  // Authentication & Users
  async login(email: string, password: string): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const session = await handleResponse<AuthSession>(res);
    setApiAuthToken(session.token);
    return session;
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const session = await handleResponse<AuthSession>(res);
    setApiAuthToken(session.token);
    return session;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; token?: string; expiresAt?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ success: boolean; message: string; token?: string; expiresAt?: string }>(res);
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role }),
    });
    return handleResponse<User>(res);
  },
};
