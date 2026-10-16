import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Client,
  Project,
  Proposal,
  Invoice,
  Agreement,
  BriefForm,
  BriefSubmission,
  StudioSettings,
  DashboardMetrics,
  ActivityLog,
  Language,
  User,
  UserRole,
  RegisterInput,
} from '../types';
import { api } from '../services/api';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_PROPOSALS,
  INITIAL_INVOICES,
  INITIAL_AGREEMENTS,
  INITIAL_BRIEF_FORMS,
  INITIAL_BRIEF_SUBMISSIONS,
  INITIAL_STUDIO_SETTINGS,
} from '../services/mockData';

export type ActiveTab =
  | 'dashboard'
  | 'clients'
  | 'projects'
  | 'briefs'
  | 'research'
  | 'proposals'
  | 'agreements'
  | 'invoices'
  | 'deliverables'
  | 'templates'
  | 'reports'
  | 'settings';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StudioContextType {
  // Navigation & Language
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyAr: string, keyEn: string) => string;

  // Selected State
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  // Public View Simulation
  publicMode: {
    type: 'portal' | 'brief' | 'proposal' | 'invoice' | null;
    token: string | null;
  };
  setPublicMode: (mode: { type: 'portal' | 'brief' | 'proposal' | 'invoice' | null; token: string | null }) => void;

  // Modals
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportProjectId: string | null;
  openReportForProject: (projectId: string) => void;

  // Data Collections
  settings: StudioSettings;
  metrics: DashboardMetrics | null;
  clients: Client[];
  projects: Project[];
  proposals: Proposal[];
  invoices: Invoice[];
  agreements: Agreement[];
  briefForms: BriefForm[];
  briefSubmissions: BriefSubmission[];
  activities: ActivityLog[];
  isLoading: boolean;

  // Data Actions
  refreshData: () => Promise<void>;
  createClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<{ success: boolean; message: string }>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStage: (id: string, stageIndex: number, isCompleted: boolean) => Promise<void>;
  createProposal: (proposal: Partial<Proposal>) => Promise<Proposal>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<Proposal | null>;
  deleteProposal: (id: string) => Promise<void>;
  acceptProposal: (id: string, signeeName: string) => Promise<any>;
  createInvoice: (invoice: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  recordPayment: (invoiceId: string, payment: any) => Promise<{ success: boolean; message: string; invoice?: Invoice }>;
  createAgreement: (agreement: Partial<Agreement>) => Promise<Agreement>;
  deleteAgreement: (id: string) => Promise<void>;
  signAgreement: (id: string, signeeName: string) => Promise<Agreement>;
  createBriefForm: (form: Partial<BriefForm>) => Promise<BriefForm>;
  deleteBriefForm: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<StudioSettings>) => Promise<void>;

  // Format Helpers
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (dateStr: string) => string;

  // Authentication & Users
  currentUser: User | null;
  isAdmin: boolean;
  usersList: User[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot' | 'reset';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot' | 'reset') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  switchUserDemo: (role: 'admin' | 'member') => Promise<void>;
  changeUserRole: (userId: string, role: UserRole) => Promise<void>;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguageState] = useState<Language>('ar');

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [publicMode, setPublicMode] = useState<{
    type: 'portal' | 'brief' | 'proposal' | 'invoice' | null;
    token: string | null;
  }>({ type: null, token: null });

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportProjectId, setReportProjectId] = useState<string | null>(null);

  const [settings, setSettings] = useState<StudioSettings>(INITIAL_STUDIO_SETTINGS);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [agreements, setAgreements] = useState<Agreement[]>(INITIAL_AGREEMENTS);
  const [briefForms, setBriefForms] = useState<BriefForm[]>(INITIAL_BRIEF_FORMS);
  const [briefSubmissions, setBriefSubmissions] = useState<BriefSubmission[]>(INITIAL_BRIEF_SUBMISSIONS);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Authentication & Role-Based Control
  const DEFAULT_ADMIN: User = {
    id: 'user_mohamed_abualsaud',
    email: 'abualss3ud@gmail.com',
    name: 'محمد أبو السعود',
    role: 'admin',
    title: 'مصمم واستراتيجي هويات بصرية مستقل | Independent Brand Identity Designer',
    avatarUrl: '/src/assets/images/designer_avatar_lead_1792158732035.jpg',
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  };

  const DEFAULT_MEMBER: User = {
    id: 'user_assistant_1',
    email: 'assistant@brandflow.studio',
    name: 'مساعد إنتاج الهوية (سارة)',
    role: 'member',
    title: 'مساعد تصميم وتطبيقات',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-02-15T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('brandflow_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.name === 'محمد أبو السعود') return u;
      }
    } catch {}
    return DEFAULT_ADMIN;
  });

  const [usersList, setUsersList] = useState<User[]>([DEFAULT_ADMIN, DEFAULT_MEMBER]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

  const isAdmin = currentUser?.role === 'admin';

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((keyAr: string, keyEn: string) => {
    return language === 'ar' ? keyAr : keyEn;
  }, [language]);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        fetchedSettings,
        fetchedMetrics,
        fetchedClients,
        fetchedProjects,
        fetchedProposals,
        fetchedInvoices,
        fetchedAgreements,
        fetchedBriefForms,
        fetchedSubmissions,
        fetchedActivities,
      ] = await Promise.all([
        api.getSettings().catch(() => INITIAL_STUDIO_SETTINGS),
        api.getStats().catch(() => null),
        api.getClients().catch(() => INITIAL_CLIENTS),
        api.getProjects().catch(() => INITIAL_PROJECTS),
        api.getProposals().catch(() => INITIAL_PROPOSALS),
        api.getInvoices().catch(() => INITIAL_INVOICES),
        api.getAgreements().catch(() => INITIAL_AGREEMENTS),
        api.getBriefForms().catch(() => INITIAL_BRIEF_FORMS),
        api.getBriefSubmissions().catch(() => INITIAL_BRIEF_SUBMISSIONS),
        api.getActivities().catch(() => []),
      ]);

      setSettings(fetchedSettings);
      setMetrics(fetchedMetrics);
      setClients(fetchedClients);
      setProjects(fetchedProjects);
      setProposals(fetchedProposals);
      setInvoices(fetchedInvoices);
      setAgreements(fetchedAgreements);
      setBriefForms(fetchedBriefForms);
      setBriefSubmissions(fetchedSubmissions);
      setActivities(fetchedActivities);
    } catch (err) {
      console.error('Error refreshing data from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Check url search params on load
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const token = params.get('token');
    if (view && token && ['portal', 'brief', 'proposal', 'invoice'].includes(view)) {
      setPublicMode({ type: view as any, token });
    }
  }, [refreshData]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openReportForProject = (projectId: string) => {
    setReportProjectId(projectId);
    setIsReportModalOpen(true);
  };

  // CRUD Implementations
  const createClient = async (data: Partial<Client>) => {
    try {
      const client = await api.createClient(data);
      setClients((prev) => [client, ...prev]);
      showToast(t(`تمت إضافة العميل "${client.name}" بنجاح`, `Client "${client.name}" added successfully`));
      refreshData();
      return client;
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة العميل', 'error');
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const client = await api.updateClient(id, updates);
      setClients((prev) => prev.map((c) => (c.id === id ? client : c)));
      showToast(t('تم تحديث بيانات العميل بنجاح', 'Client updated successfully'));
      refreshData();
      return client;
    } catch (err: any) {
      showToast(err.message || 'فشل التحديث', 'error');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const res = await api.deleteClient(id);
      showToast(res.message);
      refreshData();
      return res;
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
      throw err;
    }
  };

  const createProject = async (data: Partial<Project>) => {
    try {
      const project = await api.createProject(data);
      setProjects((prev) => [project, ...prev]);
      showToast(t(`تم إنشاء المشروع "${project.name}" بنجاح`, `Project "${project.name}" created successfully`));
      refreshData();
      return project;
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء المشروع', 'error');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const project = await api.updateProject(id, updates);
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
      showToast(t('تم تحديث بيانات المشروع بنجاح', 'Project updated successfully'));
      refreshData();
      return project;
    } catch (err: any) {
      showToast(err.message || 'فشل التحديث', 'error');
      throw err;
    }
  };

  const updateProjectStage = async (id: string, stageIndex: number, isCompleted: boolean) => {
    try {
      const updated = await api.updateProjectStage(id, stageIndex, isCompleted);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(
        isCompleted
          ? t('تم اعتماد واكتمال المرحلة بنجاح', 'Stage marked as completed')
          : t('تمت إعادة فتح المرحلة للمراجعة', 'Stage reopened')
      );
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث المرحلة', 'error');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await api.deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (selectedProjectId === id) setSelectedProjectId(null);
        showToast(res.message || t('تم حذف المشروع بنجاح', 'Project deleted successfully'));
        refreshData();
      } else {
        showToast(res.message || t('فشل حذف المشروع', 'Failed to delete project'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || t('فشل حذف المشروع', 'Failed to delete project'), 'error');
    }
  };

  const createProposal = async (data: Partial<Proposal>) => {
    try {
      const proposal = await api.createProposal(data);
      setProposals((prev) => [proposal, ...prev]);
      showToast(t(`تم إنشاء عرض السعر ${proposal.quoteNumber}`, `Proposal ${proposal.quoteNumber} created`));
      refreshData();
      return proposal;
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء عرض السعر', 'error');
      throw err;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      const prop = await api.updateProposal(id, updates);
      setProposals((prev) => prev.map((p) => (p.id === id ? prop : p)));
      showToast(t('تم تحديث عرض السعر بنجاح', 'Proposal updated'));
      refreshData();
      return prop;
    } catch (err: any) {
      showToast(err.message || 'فشل التحديث', 'error');
      throw err;
    }
  };

  const acceptProposal = async (id: string, signeeName: string) => {
    try {
      const res = await api.acceptProposal(id, signeeName);
      showToast(t(`تم اعتماد عرض السعر بنجاح بواسطة ${signeeName}`, `Proposal accepted by ${signeeName}`));
      refreshData();
      return res;
    } catch (err: any) {
      showToast(err.message || 'فشل اعتماد العرض', 'error');
      throw err;
    }
  };

  const createInvoice = async (data: Partial<Invoice>) => {
    try {
      const inv = await api.createInvoice(data);
      setInvoices((prev) => [inv, ...prev]);
      showToast(t(`تم إصدار الفاتورة رقم ${inv.invoiceNumber}`, `Invoice ${inv.invoiceNumber} created`));
      refreshData();
      return inv;
    } catch (err: any) {
      showToast(err.message || 'فشل إصدار الفاتورة', 'error');
      throw err;
    }
  };

  const recordPayment = async (invoiceId: string, payment: any) => {
    try {
      const res = await api.recordPayment(invoiceId, payment);
      if (res.success) {
        showToast(res.message);
        refreshData();
      } else {
        showToast(res.message, 'error');
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدفعة', 'error');
      throw err;
    }
  };

  const createAgreement = async (data: Partial<Agreement>) => {
    try {
      const agr = await api.createAgreement(data);
      setAgreements((prev) => [agr, ...prev]);
      showToast(t(`تم إنشاء الاتفاقية ${agr.agreementNumber}`, `Agreement ${agr.agreementNumber} created`));
      refreshData();
      return agr;
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الاتفاقية', 'error');
      throw err;
    }
  };

  const signAgreement = async (id: string, signeeName: string) => {
    try {
      const agr = await api.signAgreement(id, signeeName);
      showToast(t('تم تسجيل توقيع واعتماد الاتفاقية', 'Agreement signed'));
      refreshData();
      return agr;
    } catch (err: any) {
      showToast(err.message || 'فشل التوقيع', 'error');
      throw err;
    }
  };

  const createBriefForm = async (data: Partial<BriefForm>) => {
    try {
      const form = await api.createBriefForm(data);
      setBriefForms((prev) => [form, ...prev]);
      showToast(t('تم إنشاء رابط نموذج البريف بنجاح', 'Brief form created successfully'));
      refreshData();
      return form;
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء النموذج', 'error');
      throw err;
    }
  };

  const updateSettings = async (updates: Partial<StudioSettings>) => {
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
      showToast(t('تم حفظ إعدادات الاستوديو بنجاح', 'Settings saved successfully'));
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const res = await api.deleteProposal(id);
      if (res.success) {
        setProposals((prev) => prev.filter((p) => p.id !== id));
        showToast(res.message || t('تم حذف عرض السعر بنجاح', 'Proposal deleted'));
        refreshData();
      } else {
        showToast(res.message || t('فشل الحذف', 'Failed to delete'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const res = await api.deleteInvoice(id);
      if (res.success) {
        setInvoices((prev) => prev.filter((i) => i.id !== id));
        showToast(res.message || t('تم حذف الفاتورة بنجاح', 'Invoice deleted'));
        refreshData();
      } else {
        showToast(res.message || t('فشل الحذف', 'Failed to delete'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
    }
  };

  const deleteAgreement = async (id: string) => {
    try {
      const res = await api.deleteAgreement(id);
      if (res.success) {
        setAgreements((prev) => prev.filter((a) => a.id !== id));
        showToast(res.message || t('تم حذف الاتفاقية بنجاح', 'Agreement deleted'));
        refreshData();
      } else {
        showToast(res.message || t('فشل الحذف', 'Failed to delete'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
    }
  };

  const deleteBriefForm = async (id: string) => {
    try {
      const res = await api.deleteBriefForm(id);
      if (res.success) {
        setBriefForms((prev) => prev.filter((f) => f.id !== id));
        setBriefSubmissions((prev) => prev.filter((s) => s.formId !== id));
        showToast(res.message || t('تم حذف نموذج البريف بنجاح', 'Brief form deleted'));
        refreshData();
      } else {
        showToast(res.message || t('فشل الحذف', 'Failed to delete'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
    }
  };

  const formatCurrency = (amount: number, curr?: string) => {
    const code = curr || settings.defaultCurrency || 'SAR';
    const num = Math.round(Number(amount) || 0).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
    if (language === 'ar') {
      if (code === 'SAR') return `${num} ر.س`;
      if (code === 'USD') return `$${num}`;
      return `${num} ${code}`;
    }
    return `${code} ${num}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const session = await api.login(email, password);
      setCurrentUser(session.user);
      localStorage.setItem('brandflow_user', JSON.stringify(session.user));
      showToast(`مرحبًا بعودتك، ${session.user.name}`, 'success');
      setIsAuthModalOpen(false);
      refreshData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول', 'error');
      return false;
    }
  };

  const register = async (input: RegisterInput): Promise<boolean> => {
    try {
      const session = await api.register(input);
      setCurrentUser(session.user);
      localStorage.setItem('brandflow_user', JSON.stringify(session.user));
      showToast(`تم إنشاء حسابك بنجاح، مرحبًا ${session.user.name}`, 'success');
      setIsAuthModalOpen(false);
      refreshData();
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الحساب', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('brandflow_user');
    localStorage.removeItem('brandflow_token');
    setCurrentUser(null);
    showToast('تم تسجيل الخروج من الاستوديو', 'info');
    setIsAuthModalOpen(true);
    setAuthModalTab('login');
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const res = await api.forgotPassword(email);
      showToast(res.message, 'success');
      return res;
    } catch (err: any) {
      showToast(err.message || 'فشل معالجة طلب استعادة كلمة المرور', 'error');
      return { success: false, message: err.message };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await api.resetPassword(token, newPassword);
      showToast(res.message, 'success');
      setAuthModalTab('login');
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث كلمة المرور', 'error');
      return false;
    }
  };

  const switchUserDemo = async (role: 'admin' | 'member') => {
    const target = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_MEMBER;
    setCurrentUser(target);
    localStorage.setItem('brandflow_user', JSON.stringify(target));
    showToast(`تم التبديل إلى: ${target.name} (${target.role === 'admin' ? 'مدير الاستوديو' : 'مصممة هويات'})`, 'info');
  };

  const changeUserRole = async (userId: string, role: UserRole) => {
    try {
      const updated = await api.updateUserRole(userId, role);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
        localStorage.setItem('brandflow_user', JSON.stringify(updated));
      }
      showToast(`تم تحديث صلاحية المستخدم إلى ${role === 'admin' ? 'مدير' : 'عضو استوديو'}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الصلاحية', 'error');
    }
  };

  return (
    <StudioContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        language,
        setLanguage,
        t,
        selectedProjectId,
        setSelectedProjectId,
        selectedClientId,
        setSelectedClientId,
        publicMode,
        setPublicMode,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        reportProjectId,
        openReportForProject,
        settings,
        metrics,
        clients,
        projects,
        proposals,
        invoices,
        agreements,
        briefForms,
        briefSubmissions,
        activities,
        isLoading,
        refreshData,
        createClient,
        updateClient,
        deleteClient,
        createProject,
        updateProject,
        deleteProject,
        updateProjectStage,
        createProposal,
        updateProposal,
        deleteProposal,
        acceptProposal,
        createInvoice,
        deleteInvoice,
        recordPayment,
        createAgreement,
        deleteAgreement,
        signAgreement,
        createBriefForm,
        deleteBriefForm,
        updateSettings,
        formatCurrency,
        formatDate,
        currentUser,
        isAdmin,
        usersList,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        switchUserDemo,
        changeUserRole,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
