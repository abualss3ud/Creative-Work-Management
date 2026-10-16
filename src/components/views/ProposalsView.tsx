import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../../context/StudioContext';
import { Proposal } from '../../types';

export const ProposalsView: React.FC = () => {
  const {
    proposals,
    clients,
    projects,
    createProposal,
    acceptProposal,
    deleteProposal,
    formatCurrency,
    formatDate,
    setPublicMode,
    setIsQuickCreateOpen,
    showToast,
    t,
  } = useStudio();

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(proposals[0] || null);
  const [signeeName, setSigneeName] = useState('');
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  const handleDeleteProposal = async (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف عرض السعر هذا؟', 'Are you sure you want to delete this proposal?'))) {
      await deleteProposal(id);
      setSelectedProposal(proposals.filter((p) => p.id !== id)[0] || null);
    }
  };

  const client = clients.find((c) => c.id === selectedProposal?.clientId);

  const copyProposalLink = (p: Proposal) => {
    const url = `${window.location.origin}/?view=proposal&token=${p.shareToken}`;
    navigator.clipboard.writeText(url);
    showToast(t('تم نسخ رابط عرض السعر للمشاركة مع العميل', 'Proposal link copied to clipboard'));
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal || !signeeName) return;
    await acceptProposal(selectedProposal.id, signeeName);
    setIsAcceptModalOpen(false);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    setSigneeName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('عروض الأسعار والمقترحات (Proposals)', 'Proposals & Quotations')}</h2>
          <p className="text-xs text-neutral-500">
            {t('صياغة مقترحات أسعار احترافية ببنود مفصلة، جداول دفعات مرحلية، وموافقة رقمية', 'Craft professional branding quotes with milestone payment schedules')}
          </p>
        </div>

        <button
          onClick={() => setIsQuickCreateOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={15} />
          <span>{t('إنشاء عرض سعر جديد', 'New Proposal')}</span>
        </button>
      </div>

      {/* Main Grid: List vs Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposals List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
            <span>{t('العروض المسجلة', 'Proposals')}</span>
            <span className="font-mono text-neutral-400">({proposals.length})</span>
          </div>

          <div className="space-y-2">
            {proposals.map((p) => {
              const c = clients.find((client) => client.id === p.clientId);
              const isSelected = selectedProposal?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProposal(p)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      {p.quoteNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0 ${
                        p.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.status === 'sent' || p.status === 'viewed'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p.status === 'accepted' && t('مقبول', 'Accepted')}
                      {p.status === 'sent' && t('مرسل', 'Sent')}
                      {p.status === 'viewed' && t('تمت المشاهدة', 'Viewed')}
                      {p.status === 'draft' && t('مسودة', 'Draft')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 leading-snug">{p.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{c?.company || c?.name}</span>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(p.totalAmount, p.currency)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyProposalLink(p)}
                      className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                    >
                      <Copy size={12} />
                      <span>{t('نسخ الرابط', 'Copy Link')}</span>
                    </button>

                    <button
                      onClick={() => setPublicMode({ type: 'proposal', token: p.shareToken })}
                      className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink size={12} />
                      <span>{t('معاينة العميل', 'Client View')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Proposal Document Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProposal ? (
            <div className="p-6 sm:p-8 bg-white border border-neutral-200/80 rounded-xl space-y-6 shadow-xs">
              {/* Document Action Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                    {selectedProposal.quoteNumber}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">{selectedProposal.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyProposalLink(selectedProposal)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <Copy size={13} />
                    <span>{t('نسخ الرابط', 'Copy Link')}</span>
                  </button>

                  <button
                    onClick={() => setPublicMode({ type: 'proposal', token: selectedProposal.shareToken })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>{t('معاينة العميل', 'Preview')}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProposal(selectedProposal.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t('حذف عرض السعر', 'Delete Proposal')}
                  >
                    <Trash2 size={15} />
                  </button>

                  {selectedProposal.status !== 'accepted' && (
                    <button
                      onClick={() => setIsAcceptModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                    >
                      <Check size={14} />
                      <span>{t('تسجيل قبول العميل', 'Record Acceptance')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Alert if Accepted */}
              {selectedProposal.status === 'accepted' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>
                      {t('تم قبول هذا العرض وتحويله لمشروع رسمي معتمد بواسطة:', 'Accepted and converted to active project by:')}{' '}
                      <strong>{selectedProposal.acceptedByName}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-emerald-800">
                    {formatDate(selectedProposal.acceptedAt || '')}
                  </span>
                </div>
              )}

              {/* Meta information row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block">{t('العميل', 'Client')}</span>
                  <span className="font-bold text-neutral-900 font-sans">{client?.company || client?.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">{t('تاريخ الإصدار', 'Issue Date')}</span>
                  <span className="text-neutral-900">{formatDate(selectedProposal.issueDate)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">{t('انتهاء الصلاحية', 'Valid Until')}</span>
                  <span className="text-neutral-900">{formatDate(selectedProposal.expiryDate)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">{t('مدة التنفيذ التقديرية', 'Est. Timeline')}</span>
                  <span className="text-neutral-900 font-sans">{selectedProposal.estimatedTimelineWeeks} {t('أسابيع عمل', 'weeks')}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('نطاق العمل والخدمات المشمولة', 'Services & Deliverables')}
                </h4>

                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-4 text-start">{t('الخدمة / البند', 'Service')}</th>
                        <th className="py-2.5 px-4 text-start">{t('المخرجات والتفاصيل', 'Deliverables')}</th>
                        <th className="py-2.5 px-4 text-center">{t('الكمية', 'Qty')}</th>
                        <th className="py-2.5 px-4 text-end">{t('السعر', 'Price')}</th>
                        <th className="py-2.5 px-4 text-end">{t('الإجمالي', 'Total')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedProposal.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-semibold text-neutral-900">{item.serviceName}</td>
                          <td className="py-3 px-4 text-neutral-600 max-w-xs">{item.description}</td>
                          <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                          <td className="py-3 px-4 text-end font-mono tabular-nums">{formatCurrency(item.unitPrice, selectedProposal.currency)}</td>
                          <td className="py-3 px-4 text-end font-mono font-bold tabular-nums">{formatCurrency(item.total, selectedProposal.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
                    <span className="font-mono font-semibold tabular-nums">{formatCurrency(selectedProposal.subtotal, selectedProposal.currency)}</span>
                  </div>
                  {selectedProposal.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-rose-700">
                      <span>{t('الخصم المطبق:', 'Discount:')}</span>
                      <span className="font-mono tabular-nums">- {formatCurrency(selectedProposal.discountAmount, selectedProposal.currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>{t('ضريبة القيمة المضافة (15%):', 'VAT (15%):')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedProposal.taxAmount, selectedProposal.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>{t('إجمالي العرض:', 'Total:')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedProposal.totalAmount, selectedProposal.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Milestone Payment Schedule */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('جدول الدفعات والمستحقات المرحلية', 'Milestone Payment Schedule')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {selectedProposal.paymentSchedule.map((sched, idx) => (
                    <div key={sched.id} className="p-3.5 border border-neutral-200 rounded-xl bg-neutral-50/70 space-y-1">
                      <div className="flex items-center justify-between font-bold text-neutral-900">
                        <span>{sched.milestoneTitle}</span>
                        <span className="font-mono">{sched.percentage}%</span>
                      </div>
                      <div className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(sched.amount, selectedProposal.currency)}
                      </div>
                      <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
                        {sched.dueDateDescription}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms and Revisions Policy */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs text-neutral-700">
                <div className="font-bold text-neutral-900">{t('سياسة التعديلات وشروط الاعتماد:', 'Revisions Policy & Terms:')}</div>
                <p className="leading-relaxed">{selectedProposal.revisionsPolicy}</p>
                <p className="leading-relaxed text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
                  {selectedProposal.terms}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-neutral-200/80 rounded-xl text-neutral-500 text-xs">
              {t('اختر عرض سعر من القائمة لعرض تفاصيله', 'Select a proposal to view')}
            </div>
          )}
        </div>
      </div>

      {/* Accept Proposal Modal */}
      {isAcceptModalOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">{t('تسجيل موافقة العميل واعتماد العرض', 'Record Client Approval')}</h3>
              <button onClick={() => setIsAcceptModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              {t(
                'عند تسجيل موافقة العميل، سيقوم النظام تلقائياً بتحويل العرض إلى مشروع قيد التنفيذ، وإصدار فاتورة العربون (50%)، وتحديث سجل الأنشطة.',
                'Approving will automatically convert this proposal to an active project and issue the initial deposit invoice.'
              )}
            </p>

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('اسم الشخص المعتمد / المفوض *', 'Authorized Signee Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={signeeName}
                  onChange={(e) => setSigneeName(e.target.value)}
                  placeholder={client?.name || 'عبدالله السبيعي'}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {t('تأكيد الاعتماد والتحويل لمشروع', 'Confirm & Convert')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
