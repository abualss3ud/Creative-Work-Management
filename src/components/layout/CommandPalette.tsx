import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderKanban,
  Users,
  FileText,
  Receipt,
  FileQuestion,
  PlusCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    projects,
    clients,
    proposals,
    invoices,
    briefForms,
    setCurrentTab,
    setSelectedProjectId,
    setIsQuickCreateOpen,
    t,
  } = useStudio();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(q) || p.serviceType.toLowerCase().includes(q)
  );

  const matchedClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
  );

  const matchedProposals = proposals.filter(
    (p) => p.quoteNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)
  );

  const matchedInvoices = invoices.filter(
    (i) => i.invoiceNumber.toLowerCase().includes(q) || i.title.toLowerCase().includes(q)
  );

  const matchedBriefs = briefForms.filter((b) => b.title.toLowerCase().includes(q));

  const hasResults =
    matchedProjects.length > 0 ||
    matchedClients.length > 0 ||
    matchedProposals.length > 0 ||
    matchedInvoices.length > 0 ||
    matchedBriefs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-neutral-200">
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'اكتب للبحث في المشاريع، العملاء، الفواتير، أو الإجراءات...',
              'Type to search projects, clients, invoices, or quick actions...'
            )}
            className="w-full py-3.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-hidden"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t('إجراءات سريعة', 'Quick Actions')}
            </div>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setIsQuickCreateOpen(true);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-start"
            >
              <div className="flex items-center gap-2">
                <PlusCircle size={15} className="text-neutral-500" />
                <span>{t('إنشاء عنصر جديد (مشروع، عميل، فاتورة، عرض)', 'Create New Item')}</span>
              </div>
              <ArrowRight size={13} className="text-neutral-400" />
            </button>
          </div>

          {/* Projects */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('المشاريع', 'Projects')} ({matchedProjects.length})
              </div>
              {matchedProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setCurrentTab('projects');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <div className="flex items-center gap-2">
                    <FolderKanban size={15} className="text-neutral-500" />
                    <span className="font-medium">{p.name}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">{p.serviceType}</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">{p.progressPercentage}%</span>
                </button>
              ))}
            </div>
          )}

          {/* Clients */}
          {matchedClients.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('العملاء', 'Clients')} ({matchedClients.length})
              </div>
              {matchedClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentTab('clients');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-neutral-500" />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">{c.company}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{c.industry}</span>
                </button>
              ))}
            </div>
          )}

          {/* Invoices */}
          {matchedInvoices.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('الفواتير', 'Invoices')} ({matchedInvoices.length})
              </div>
              {matchedInvoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setCurrentTab('invoices');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <div className="flex items-center gap-2">
                    <Receipt size={15} className="text-neutral-500" />
                    <span className="font-mono font-medium">{inv.invoiceNumber}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600">{inv.title}</span>
                  </div>
                  <span className="font-mono text-neutral-600">{inv.totalAmount} {inv.currency}</span>
                </button>
              ))}
            </div>
          )}

          {/* Proposals */}
          {matchedProposals.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('عروض الأسعار', 'Proposals')} ({matchedProposals.length})
              </div>
              {matchedProposals.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setCurrentTab('proposals');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-neutral-500" />
                    <span className="font-mono font-medium">{prop.quoteNumber}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600">{prop.title}</span>
                  </div>
                  <span className="font-mono text-neutral-600">{prop.totalAmount} {prop.currency}</span>
                </button>
              ))}
            </div>
          )}

          {/* Briefs */}
          {matchedBriefs.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('نماذج البريف', 'Brief Forms')} ({matchedBriefs.length})
              </div>
              {matchedBriefs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setCurrentTab('briefs');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <div className="flex items-center gap-2">
                    <FileQuestion size={15} className="text-neutral-500" />
                    <span className="font-medium">{b.title}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{b.status}</span>
                </button>
              ))}
            </div>
          )}

          {!hasResults && query.length > 0 && (
            <div className="p-8 text-center text-xs text-neutral-400">
              {t('لا توجد نتائج مطابقة لبحثك', 'No matching results found')}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span>{t('استخدم الأسهم للتنقل وEnter للاختيار', 'Use arrows to navigate, Enter to select')}</span>
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-neutral-200 rounded">ESC للإغلاق</kbd>
        </div>
      </div>
    </div>
  );
};
