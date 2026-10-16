import React, { useState } from 'react';
import {
  FileSignature,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  ExternalLink,
  Shield,
  X,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../../context/StudioContext';
import { Agreement } from '../../types';

export const AgreementsView: React.FC = () => {
  const {
    agreements,
    clients,
    projects,
    createAgreement,
    signAgreement,
    deleteAgreement,
    formatDate,
    setIsQuickCreateOpen,
    showToast,
    settings,
    t,
  } = useStudio();

  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(agreements[0] || null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signeeName, setSigneeName] = useState('');

  const handleDeleteAgreement = async (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذه الاتفاقية؟', 'Are you sure you want to delete this agreement?'))) {
      await deleteAgreement(id);
      setSelectedAgreement(agreements.filter((a) => a.id !== id)[0] || null);
    }
  };

  const client = clients.find((c) => c.id === selectedAgreement?.clientId);
  const project = projects.find((p) => p.id === selectedAgreement?.projectId);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement || !signeeName) return;
    const updated = await signAgreement(selectedAgreement.id, signeeName);
    setSelectedAgreement(updated);
    setIsSignModalOpen(false);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    setSigneeName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('الاتفاقيات والعقود', 'Agreements & Contracts')}</h2>
          <p className="text-xs text-neutral-500">
            {t('توثيق نطاق العمل، حقوق الملكية الفكرية، سياسة التعديلات، وشروط التسليم', 'Document scope of work, intellectual property transfer, and revision policies')}
          </p>
        </div>

        <button
          onClick={() => setIsQuickCreateOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={15} />
          <span>{t('إنشاء اتفاقية جديدة', 'New Agreement')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agreements List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
            <span>{t('الاتفاقيات المبرمة', 'Agreements')}</span>
            <span className="font-mono text-neutral-400">({agreements.length})</span>
          </div>

          <div className="space-y-2">
            {agreements.map((agr) => {
              const c = clients.find((client) => client.id === agr.clientId);
              const isSelected = selectedAgreement?.id === agr.id;

              return (
                <div
                  key={agr.id}
                  onClick={() => setSelectedAgreement(agr)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      {agr.agreementNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0 ${
                        agr.status === 'signed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {agr.status === 'signed' ? t('موقعة ومعتمدة', 'Signed') : t('مسودة', 'Draft')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 leading-snug">{agr.title}</h3>

                  <div className="text-[11px] text-neutral-500 truncate">
                    {c?.company || c?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Agreement Document Reader */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAgreement ? (
            <div className="p-6 sm:p-8 bg-white border border-neutral-200/80 rounded-xl space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                    {selectedAgreement.agreementNumber}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">{selectedAgreement.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteAgreement(selectedAgreement.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t('حذف الاتفاقية', 'Delete Agreement')}
                  >
                    <Trash2 size={15} />
                  </button>

                  {selectedAgreement.status !== 'signed' && (
                    <button
                      onClick={() => setIsSignModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                    >
                      <CheckCircle2 size={14} />
                      <span>{t('تسجيل توقيع الاتفاقية', 'Sign Agreement')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Signed Banner */}
              {selectedAgreement.status === 'signed' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-700" />
                    <span>
                      {t('تم توقيع واعتماد بنود هذا العقد رسمياً بواسطة:', 'Formally signed & ratified by:')}{' '}
                      <strong>{selectedAgreement.signeeName}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-emerald-800">
                    {formatDate(selectedAgreement.signedAt || '')}
                  </span>
                </div>
              )}

              {/* Legal Notice */}
              <div className="p-3 bg-neutral-50 rounded-lg text-[11px] text-neutral-500 leading-relaxed">
                {t(
                  'ملاحظة: هذا السجل يوثق شروط تقديم الخدمات الإبداعية وحقوق الملكية الفكرية المعتمدة بين الطرفين.',
                  'Note: This document records the agreed creative service scope and intellectual property terms.'
                )}
              </div>

              {/* Core Clauses */}
              <div className="space-y-4 text-xs divide-y divide-neutral-100">
                <div className="pt-3 first:pt-0 space-y-1">
                  <h4 className="font-bold text-neutral-900">1. نطاق العمل والتنفيذ</h4>
                  <p className="text-neutral-700 leading-relaxed">{selectedAgreement.scopeOfWork}</p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-neutral-900">2. المخرجات وقائمة التسليم</h4>
                  <ul className="list-disc list-inside space-y-1 text-neutral-700">
                    {selectedAgreement.deliverablesList.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-neutral-900">3. المقابل المالي ومواعيد الدفعات</h4>
                  <p className="text-neutral-700 leading-relaxed">{selectedAgreement.compensationTerms}</p>
                  <p className="text-neutral-500 mt-1">{selectedAgreement.paymentMilestones}</p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-neutral-900">4. سياسة التعديلات وآلية الاعتماد</h4>
                  <p className="text-neutral-700 leading-relaxed">{selectedAgreement.revisionsAndAlterations}</p>
                  <p className="text-neutral-500 mt-1">{selectedAgreement.approvalMechanism}</p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-neutral-900">5. حقوق الملكية الفكرية والملفات المصدرية</h4>
                  <p className="text-neutral-700 leading-relaxed">{selectedAgreement.intellectualPropertyRights}</p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-neutral-900">6. شروط التأجيل والإلغاء</h4>
                  <p className="text-neutral-700 leading-relaxed">{selectedAgreement.cancellationAndPostponement}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-neutral-200/80 rounded-xl text-neutral-500 text-xs">
              {t('اختر اتفاقية لعرض تفاصيلها وشروطها', 'Select an agreement to view')}
            </div>
          )}
        </div>
      </div>

      {/* Sign Agreement Modal */}
      {isSignModalOpen && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">{t('تسجيل توقيع الاتفاقية', 'Sign Agreement')}</h3>
              <button onClick={() => setIsSignModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('اسم الموقع أو المفوض بالتوقيع *', 'Signee Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={signeeName}
                  onChange={(e) => setSigneeName(e.target.value)}
                  placeholder={client?.name || 'عبدالله السبيعي (الرئيس التنفيذي)'}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {t('تأكيد تسجيل التوقيع', 'Confirm Signature')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
