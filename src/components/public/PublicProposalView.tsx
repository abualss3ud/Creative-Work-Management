import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Check,
  ArrowLeft,
  Printer,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../../context/StudioContext';

export const PublicProposalView: React.FC = () => {
  const {
    proposals,
    clients,
    settings,
    setPublicMode,
    acceptProposal,
    formatCurrency,
    formatDate,
    t,
  } = useStudio();

  const proposal = proposals[0];
  const client = clients.find((c) => c.id === proposal?.clientId);

  const [signeeName, setSigneeName] = useState('');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !signeeName) return;
    await acceptProposal(proposal.id, signeeName);
    setIsSignModalOpen(false);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 pb-16 font-sans">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white px-4 py-2.5 text-xs flex items-center justify-between no-print">
        <span className="font-mono">
          {settings.studioName} · {t('عرض سعر معتمد رسمي', 'Official Proposal Document')}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            <Printer size={13} />
            <span>{t('طباعة', 'Print')}</span>
          </button>
          <button
            onClick={() => setPublicMode({ type: null, token: null })}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <ArrowLeft size={13} />
            <span>{t('العودة للاستوديو', 'Back to Studio')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10 space-y-6">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                {settings.studioName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                {proposal?.title}
              </h1>
              <span className="text-xs font-mono text-neutral-500 block">
                {proposal?.quoteNumber}
              </span>
            </div>

            <div className="text-end text-xs font-mono space-y-1">
              <div>
                <span className="text-neutral-400">{t('تاريخ الإصدار:', 'Issue Date:')} </span>
                <span className="text-neutral-900 font-bold">{formatDate(proposal?.issueDate || '')}</span>
              </div>
              <div>
                <span className="text-neutral-400">{t('ساري حتى:', 'Valid Until:')} </span>
                <span className="text-neutral-900 font-bold">{formatDate(proposal?.expiryDate || '')}</span>
              </div>
            </div>
          </div>

          {/* Status banner */}
          {proposal?.status === 'accepted' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>
                  {t('تم اعتماد هذا العرض رسمياً بواسطة:', 'Officially Accepted by:')} <strong>{proposal.acceptedByName}</strong>
                </span>
              </div>
              <span className="font-mono text-emerald-800">{formatDate(proposal.acceptedAt || '')}</span>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950 no-print">
              <span>{t('عرض السعر بانتظار موافقة واعتماد العميل للبدء بتنفيذ المشروع.', 'Awaiting client approval.')}</span>
              <button
                onClick={() => setIsSignModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
              >
                {t('قبول واعتماد هذا العرض الآن', 'Accept Proposal Now')}
              </button>
            </div>
          )}

          {/* Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4 text-start">{t('الخدمة / البند', 'Service')}</th>
                  <th className="py-2.5 px-4 text-start">{t('التفاصيل والمخرجات', 'Deliverables')}</th>
                  <th className="py-2.5 px-4 text-end">{t('الإجمالي', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {proposal?.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-semibold text-neutral-900">{item.serviceName}</td>
                    <td className="py-3 px-4 text-neutral-600 max-w-sm">{item.description}</td>
                    <td className="py-3 px-4 text-end font-mono font-bold tabular-nums">
                      {formatCurrency(item.total, proposal?.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t('المجموع قبل الضريبة:', 'Subtotal:')}</span>
                <span className="font-mono font-semibold tabular-nums">{formatCurrency(proposal?.subtotal || 0, proposal?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t('ضريبة القيمة المضافة (15%):', 'VAT (15%):')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(proposal?.taxAmount || 0, proposal?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>{t('الإجمالي النهائي المطلوب:', 'Total:')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(proposal?.totalAmount || 0, proposal?.currency)}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {t('جدول الدفعات والمستحقات', 'Payment Milestones')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {proposal?.paymentSchedule.map((sched) => (
                <div key={sched.id} className="p-3.5 border border-neutral-200 rounded-xl bg-neutral-50/70 space-y-1">
                  <div className="font-bold text-neutral-900">{sched.milestoneTitle} ({sched.percentage}%)</div>
                  <div className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(sched.amount, proposal.currency)}
                  </div>
                  <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
                    {sched.dueDateDescription}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      {isSignModalOpen && proposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">{t('تأكيد قبول عرض السعر', 'Confirm Acceptance')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('يُرجى إدخال اسمك الكريم لتأكيد قبول العرض وبدء تنفيذ المشروع مع الاستوديو.', 'Enter your name to confirm acceptance.')}
            </p>
            <form onSubmit={handleAccept} className="space-y-4">
              <input
                type="text"
                required
                value={signeeName}
                onChange={(e) => setSigneeName(e.target.value)}
                placeholder={client?.name || 'عبدالله السبيعي'}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {t('تأكيد الموافقة', 'Confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
