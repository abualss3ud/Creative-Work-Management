import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Users,
  FileText,
  Receipt,
  FileQuestion,
  Check,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const QuickCreateModal: React.FC = () => {
  const {
    isQuickCreateOpen,
    setIsQuickCreateOpen,
    clients,
    projects,
    createClient,
    createProject,
    createProposal,
    createInvoice,
    createBriefForm,
    setCurrentTab,
    settings,
    t,
  } = useStudio();

  const [activeTab, setActiveTab] = useState<'project' | 'client' | 'proposal' | 'invoice' | 'brief'>('project');

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: 'المملكة العربية السعودية',
    industry: '',
    source: 'موقع إلكتروني',
    internalNotes: '',
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    clientId: clients[0]?.id || '',
    serviceType: 'هوية بصرية متكاملة وتغليف',
    description: '',
    budget: 35000,
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [proposalForm, setProposalForm] = useState({
    title: '',
    clientId: clients[0]?.id || '',
    serviceName: 'تصميم الهوية البصرية الشاملة',
    amount: 30000,
    estimatedWeeks: 6,
  });

  const [invoiceForm, setInvoiceForm] = useState({
    title: 'فاتورة عربون (50%)',
    clientId: clients[0]?.id || '',
    projectId: projects[0]?.id || '',
    type: 'deposit' as const,
    amount: 15000,
  });

  const [briefFormState, setBriefFormState] = useState({
    title: '',
    clientId: clients[0]?.id || '',
    projectId: projects[0]?.id || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickCreateOpen) return null;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) return;
    setIsSubmitting(true);
    try {
      await createClient({
        ...clientForm,
        status: 'lead',
      });
      setIsQuickCreateOpen(false);
      setCurrentTab('clients');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.clientId) return;
    setIsSubmitting(true);
    try {
      await createProject(projectForm);
      setIsQuickCreateOpen(false);
      setCurrentTab('projects');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.title || !proposalForm.clientId) return;
    setIsSubmitting(true);
    try {
      await createProposal({
        title: proposalForm.title,
        clientId: proposalForm.clientId,
        estimatedTimelineWeeks: proposalForm.estimatedWeeks,
        items: [
          {
            id: `item-${Date.now()}`,
            serviceName: proposalForm.serviceName,
            description: 'تشمل تطوير الشعار، المنظومة البصرية، ودليل الاستخدام الشامل.',
            deliverablesSummary: 'Vector Logos, Guidelines & Stationery',
            quantity: 1,
            unitPrice: proposalForm.amount,
            total: proposalForm.amount,
          },
        ],
        subtotal: proposalForm.amount,
        taxRate: settings.defaultTaxRate,
        taxAmount: (proposalForm.amount * settings.defaultTaxRate) / 100,
        totalAmount: proposalForm.amount * (1 + settings.defaultTaxRate / 100),
      });
      setIsQuickCreateOpen(false);
      setCurrentTab('proposals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.title || !invoiceForm.clientId) return;
    setIsSubmitting(true);
    try {
      await createInvoice({
        title: invoiceForm.title,
        clientId: invoiceForm.clientId,
        projectId: invoiceForm.projectId || undefined,
        type: invoiceForm.type,
        subtotal: invoiceForm.amount,
        taxRate: settings.defaultTaxRate,
        items: [
          {
            id: `item-${Date.now()}`,
            description: invoiceForm.title,
            amount: invoiceForm.amount,
          },
        ],
      });
      setIsQuickCreateOpen(false);
      setCurrentTab('invoices');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefFormState.title) return;
    setIsSubmitting(true);
    try {
      await createBriefForm({
        title: briefFormState.title,
        clientId: briefFormState.clientId || undefined,
        projectId: briefFormState.projectId || undefined,
      });
      setIsQuickCreateOpen(false);
      setCurrentTab('briefs');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">{t('إضافة عنصر جديد للاستوديو', 'Create New Item')}</h2>
          <button
            onClick={() => setIsQuickCreateOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-100 bg-neutral-50/70 p-1.5 gap-1 text-xs">
          {[
            { id: 'project', label: t('مشروع', 'Project'), icon: FolderKanban },
            { id: 'client', label: t('عميل', 'Client'), icon: Users },
            { id: 'proposal', label: t('عرض سعر', 'Proposal'), icon: FileText },
            { id: 'invoice', label: t('فاتورة', 'Invoice'), icon: Receipt },
            { id: 'brief', label: t('نموذج بريف', 'Brief Form'), icon: FileQuestion },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* PROJECT FORM */}
          {activeTab === 'project' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('اسم المشروع *', 'Project Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder={t('مثال: الهوية البصرية لمتجر أزياء زان', 'e.g. Visual Identity for Zaan Fashion')}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('العميل المرتبط *', 'Client *')}
                  </label>
                  <select
                    required
                    value={projectForm.clientId}
                    onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="" disabled>{t('اختر العميل...', 'Select client...')}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('نوع الخدمة', 'Service Type')}
                  </label>
                  <input
                    type="text"
                    value={projectForm.serviceType}
                    onChange={(e) => setProjectForm({ ...projectForm, serviceType: e.target.value })}
                    placeholder="هوية متكاملة، ريبراندينج، تغليف"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('الميزانية التقديرية (ر.س)', 'Budget (SAR)')}
                  </label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('موعد التسليم المتوقع', 'Target Date')}
                  </label>
                  <input
                    type="date"
                    value={projectForm.targetDate}
                    onChange={(e) => setProjectForm({ ...projectForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {isSubmitting ? t('جارٍ الحفظ...', 'Saving...') : t('إنشاء المشروع', 'Create Project')}
                </button>
              </div>
            </form>
          )}

          {/* CLIENT FORM */}
          {activeTab === 'client' && (
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('اسم العميل / جهة الاتصال *', 'Contact Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="مثال: فيصل الراجحي"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('اسم الشركة أو النشاط *', 'Company Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="مثال: شركة مدار العقارية"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('البريد الإلكتروني *', 'Email *')}
                  </label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="faisal@example.com"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('رقم الهاتف', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('القطاع أو المجال', 'Industry')}
                  </label>
                  <input
                    type="text"
                    value={clientForm.industry}
                    onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
                    placeholder="مطاعم وكافيهات، أزياء، عقارات"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('مصدر العميل', 'Lead Source')}
                  </label>
                  <select
                    value={clientForm.source}
                    onChange={(e) => setClientForm({ ...clientForm, source: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="توصية عميل سابق">{t('توصية عميل سابق', 'Referral')}</option>
                    <option value="Instagram / Portfolio">{t('انستغرام / معرض الأعمال', 'Instagram')}</option>
                    <option value="LinkedIn">{t('لينكد إن', 'LinkedIn')}</option>
                    <option value="الموقع الإلكتروني">{t('الموقع الإلكتروني', 'Website')}</option>
                    <option value="أخرى">{t('أخرى', 'Other')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {isSubmitting ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ العميل', 'Save Client')}
                </button>
              </div>
            </form>
          )}

          {/* PROPOSAL FORM */}
          {activeTab === 'proposal' && (
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('عنوان العرض *', 'Proposal Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="عرض سعر تصميم هوية واستراتيجية علامة"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('العميل المستهدف *', 'Client *')}
                  </label>
                  <select
                    required
                    value={proposalForm.clientId}
                    onChange={(e) => setProposalForm({ ...proposalForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('قيمة العرض قبل الضريبة (ر.س)', 'Amount before VAT (SAR)')}
                  </label>
                  <input
                    type="number"
                    value={proposalForm.amount}
                    onChange={(e) => setProposalForm({ ...proposalForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {isSubmitting ? t('جارٍ الإنشاء...', 'Creating...') : t('إنشاء عرض السعر', 'Create Proposal')}
                </button>
              </div>
            </form>
          )}

          {/* INVOICE FORM */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('عنوان الفاتورة *', 'Invoice Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                  placeholder="فاتورة عربون أو دفعة مرحلية"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('العميل *', 'Client *')}
                  </label>
                  <select
                    required
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('المبلغ قبل الضريبة (ر.س) *', 'Amount before Tax (SAR) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {isSubmitting ? t('جارٍ الإصدار...', 'Issuing...') : t('إصدار الفاتورة', 'Issue Invoice')}
                </button>
              </div>
            </form>
          )}

          {/* BRIEF FORM */}
          {activeTab === 'brief' && (
            <form onSubmit={handleCreateBrief} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('عنوان استبيان البريف *', 'Brief Form Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={briefFormState.title}
                  onChange={(e) => setBriefFormState({ ...briefFormState, title: e.target.value })}
                  placeholder="مثال: بريف استراتيجية هوية متجر قِمة"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('العميل', 'Client')}
                  </label>
                  <select
                    value={briefFormState.clientId}
                    onChange={(e) => setBriefFormState({ ...briefFormState, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="">{t('غير محدد', 'None')}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('المشروع المرتبط', 'Project')}
                  </label>
                  <select
                    value={briefFormState.projectId}
                    onChange={(e) => setBriefFormState({ ...briefFormState, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="">{t('غير محدد', 'None')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {isSubmitting ? t('جارٍ الإنشاء...', 'Creating...') : t('إنشاء رابط البريف', 'Create Brief Link')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
