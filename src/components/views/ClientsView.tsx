import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  FolderKanban,
  Receipt,
  FileText,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Archive,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { Client, ClientStatus } from '../../types';

export const ClientsView: React.FC = () => {
  const {
    clients,
    projects,
    proposals,
    invoices,
    createClient,
    updateClient,
    deleteClient,
    setSelectedProjectId,
    setCurrentTab,
    setIsQuickCreateOpen,
    formatCurrency,
    formatDate,
    t,
  } = useStudio();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Client>>({});

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData(client);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    await updateClient(selectedClient.id, formData);
    setIsEditing(false);
    setSelectedClient({ ...selectedClient, ...formData } as Client);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    const client = await createClient({
      name: formData.name,
      company: formData.company || '',
      email: formData.email,
      phone: formData.phone || '',
      country: formData.country || 'المملكة العربية السعودية',
      industry: formData.industry || '',
      source: formData.source || 'أخرى',
      status: formData.status || 'lead',
      internalNotes: formData.internalNotes || '',
    });
    setIsNewClientOpen(false);
    setSelectedClient(client);
  };

  const handleDelete = async (client: Client) => {
    if (confirm(t(`هل أنت متأكد من حذف أو أرشفة العميل "${client.name}"؟`, `Are you sure you want to delete or archive "${client.name}"?`))) {
      await deleteClient(client.id);
      if (selectedClient?.id === client.id) {
        setSelectedClient(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('إدارة علاقات العملاء (CRM)', 'Clients & CRM')}</h2>
          <p className="text-xs text-neutral-500">
            {t('سجل تفصيلي بكافة العملاء والمشاريع والفواتير المرتبطة بهم', 'Maintain clients, history, proposals, and linked financial records')}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              company: '',
              email: '',
              phone: '',
              country: 'المملكة العربية السعودية',
              industry: '',
              source: 'Instagram / Portfolio',
              status: 'active',
              internalNotes: '',
            });
            setIsNewClientOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={15} />
          <span>{t('إضافة عميل جديد', 'Add Client')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200/80 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search size={15} className="text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('البحث باسم العميل، الشركة، أو القطاع...', 'Search by client name, company, industry...')}
            className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-hidden"
          />
        </div>

        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs p-1 bg-neutral-100 rounded-lg">
          {[
            { id: 'all', label: t('الكل', 'All') },
            { id: 'active', label: t('نشط', 'Active') },
            { id: 'negotiating', label: t('تفاوض', 'Negotiating') },
            { id: 'lead', label: t('محتمل', 'Lead') },
            { id: 'archived', label: t('مؤرشف', 'Archived') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);
          const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`p-5 bg-white border rounded-xl transition-all cursor-pointer shadow-xs hover:border-neutral-400/80 ${
                selectedClient?.id === client.id ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900">{client.name}</h3>
                  <div className="text-xs text-neutral-600 font-medium">{client.company}</div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                    client.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : client.status === 'negotiating'
                      ? 'bg-amber-50 text-amber-700'
                      : client.status === 'lead'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {client.status === 'active' && t('عميل نشط', 'Active')}
                  {client.status === 'negotiating' && t('قيد التفاوض', 'Negotiating')}
                  {client.status === 'lead' && t('عميل محتمل', 'Lead')}
                  {client.status === 'archived' && t('مؤرشف', 'Archived')}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
                <div className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-neutral-400 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-neutral-400 shrink-0" />
                    <span className="font-mono">{client.phone}</span>
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-center gap-2">
                    <Building size={13} className="text-neutral-400 shrink-0" />
                    <span>{client.industry}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {clientProjects.length} {t('مشاريع', 'projects')}
                </span>
                <span className="font-mono font-medium text-neutral-900 tabular-nums">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="p-12 text-center bg-white border border-neutral-200/80 rounded-xl space-y-3">
          <Users size={32} className="mx-auto text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900">{t('لا يوجد عملاء مطابقون للبحث', 'No clients match your filter')}</h3>
          <p className="text-xs text-neutral-500">{t('جرّب تغيير كلمات البحث أو إضافة عميل جديد', 'Try adjusting your search criteria or add a new client.')}</p>
        </div>
      )}

      {/* Client Detail Drawer */}
      {selectedClient && !isEditing && (
        <div className="fixed inset-y-0 end-0 w-full max-w-lg bg-white border-s border-neutral-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">{t('ملف العميل التفصيلي', 'Client Details')}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(selectedClient)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                title={t('تعديل البيانات', 'Edit')}
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(selectedClient)}
                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title={t('حذف أو أرشفة', 'Delete / Archive')}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">{selectedClient.name}</h2>
                <span className="text-xs text-neutral-500">({selectedClient.company})</span>
              </div>
              <div className="text-xs text-neutral-500">
                {t('مصدر العميل:', 'Source:')} {selectedClient.source} · {selectedClient.country}
              </div>
            </div>

            {/* Quick Actions for this Client */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setIsQuickCreateOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>{t('مشروع جديد', 'New Project')}</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('proposals');
                  setIsQuickCreateOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileText size={14} />
                <span>{t('عرض سعر', 'New Proposal')}</span>
              </button>
            </div>

            {/* Contact details */}
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t('البريد الإلكتروني', 'Email')}</span>
                <span className="font-mono text-neutral-900 select-all">{selectedClient.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t('رقم الهاتف', 'Phone')}</span>
                <span className="font-mono text-neutral-900 select-all">{selectedClient.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t('القطاع', 'Industry')}</span>
                <span className="text-neutral-900">{selectedClient.industry || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t('تاريخ الإضافة', 'Date Added')}</span>
                <span className="font-mono text-neutral-900">{formatDate(selectedClient.createdAt)}</span>
              </div>
            </div>

            {/* Internal Notes */}
            {selectedClient.internalNotes && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-neutral-700">{t('ملاحظات داخلية للمصمم', 'Internal Designer Notes')}</div>
                <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">
                  {selectedClient.internalNotes}
                </div>
              </div>
            )}

            {/* Associated Projects */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
                <span>{t('المشاريع المرتبطة', 'Associated Projects')}</span>
                <span className="font-mono text-neutral-400">
                  {projects.filter((p) => p.clientId === selectedClient.id).length}
                </span>
              </div>

              <div className="space-y-2">
                {projects
                  .filter((p) => p.clientId === selectedClient.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setCurrentTab('projects');
                      }}
                      className="p-3 bg-white border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors cursor-pointer space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-neutral-900">
                        <span>{p.name}</span>
                        <span className="font-mono text-[11px] text-neutral-500">{p.progressPercentage}%</span>
                      </div>
                      <div className="text-neutral-500 flex items-center justify-between">
                        <span>{p.serviceType}</span>
                        <span className="font-mono">{formatCurrency(p.budget, p.currency)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Associated Invoices */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
                <span>{t('الفواتير والمدفوعات', 'Invoices & Payments')}</span>
                <span className="font-mono text-neutral-400">
                  {invoices.filter((i) => i.clientId === selectedClient.id).length}
                </span>
              </div>

              <div className="space-y-2">
                {invoices
                  .filter((i) => i.clientId === selectedClient.id)
                  .map((inv) => (
                    <div key={inv.id} className="p-3 bg-white border border-neutral-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-neutral-900">{inv.invoiceNumber}</span>
                        <span className="font-semibold">{formatCurrency(inv.totalAmount, inv.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                        <span>{inv.title}</span>
                        <span className={inv.status === 'paid' ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                          {inv.status === 'paid' ? t('مدفوعة بالكامل', 'Paid') : `${t('المتبقي', 'Due')}: ${formatCurrency(inv.balanceDue, inv.currency)}`}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditing && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">{t('تعديل بيانات العميل', 'Edit Client')}</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الاسم', 'Name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الشركة', 'Company')}</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('البريد', 'Email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الهاتف', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الحالة', 'Status')}</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="active">{t('عميل نشط', 'Active')}</option>
                    <option value="negotiating">{t('قيد التفاوض', 'Negotiating')}</option>
                    <option value="lead">{t('عميل محتمل', 'Lead')}</option>
                    <option value="archived">{t('مؤرشف', 'Archived')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('القطاع', 'Industry')}</label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('ملاحظات داخلية', 'Internal Notes')}</label>
                <textarea
                  rows={3}
                  value={formData.internalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {t('حفظ التعديلات', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">{t('إضافة عميل جديد', 'Add New Client')}</h3>
              <button onClick={() => setIsNewClientOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الاسم *', 'Name *')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="فهد الشمري"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الشركة / النشاط *', 'Company *')}</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مؤسسة نماء للتجارة"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('البريد *', 'Email *')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="fahad@example.com"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الهاتف', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 50 111 2222"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('القطاع', 'Industry')}</label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="التقنية، الأزياء، الضيافة"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الحالة', 'Status')}</label>
                  <select
                    value={formData.status || 'lead'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="lead">{t('عميل محتمل', 'Lead')}</option>
                    <option value="contacted">{t('تم التواصل', 'Contacted')}</option>
                    <option value="negotiating">{t('قيد التفاوض', 'Negotiating')}</option>
                    <option value="active">{t('عميل نشط', 'Active')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('ملاحظات داخلية', 'Internal Notes')}</label>
                <textarea
                  rows={2}
                  value={formData.internalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="أي معلومات مهمة حول متطلبات العميل..."
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {t('حفظ العميل', 'Create Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
