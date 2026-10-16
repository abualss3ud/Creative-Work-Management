import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  X,
  Trash2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { BriefForm, BriefSubmission } from '../../types';

export const BriefFormsView: React.FC = () => {
  const {
    briefForms,
    briefSubmissions,
    clients,
    projects,
    createBriefForm,
    deleteBriefForm,
    formatDate,
    setPublicMode,
    showToast,
    t,
  } = useStudio();

  const [selectedForm, setSelectedForm] = useState<BriefForm | null>(briefForms[0] || null);
  const [selectedSubmission, setSelectedSubmission] = useState<BriefSubmission | null>(
    briefSubmissions.find((s) => s.formId === briefForms[0]?.id) || null
  );

  const handleDeleteBriefForm = async (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف نموذج البريف هذا؟', 'Are you sure you want to delete this brief form?'))) {
      await deleteBriefForm(id);
      setSelectedForm(briefForms.filter((f) => f.id !== id)[0] || null);
    }
  };

  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newProjectId, setNewProjectId] = useState('');

  const handleSelectForm = (form: BriefForm) => {
    setSelectedForm(form);
    const sub = briefSubmissions.find((s) => s.formId === form.id || s.id === form.submissionId);
    setSelectedSubmission(sub || null);
  };

  const copyShareLink = (form: BriefForm) => {
    const url = `${window.location.origin}/?view=brief&token=${form.shareToken}`;
    navigator.clipboard.writeText(url);
    showToast(t('تم نسخ رابط نموذج البريف لمشاركته مع العميل', 'Brief link copied to clipboard'));
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const form = await createBriefForm({
      title: newTitle,
      clientId: newClientId || undefined,
      projectId: newProjectId || undefined,
    });
    setIsNewFormModalOpen(false);
    setSelectedForm(form);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('نماذج البريف والاستبيانات', 'Client Brief System')}</h2>
          <p className="text-xs text-neutral-500">
            {t('نماذج تفاعلية مخصصة بدون كود مع روابط عامة للعملاء لجمع متطلبات وأهداف الهوية', 'No-code interactive briefs with shareable client links')}
          </p>
        </div>

        <button
          onClick={() => setIsNewFormModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={15} />
          <span>{t('إنشاء نموذج بريف جديد', 'New Brief Form')}</span>
        </button>
      </div>

      {/* Main Workspace Split: Forms List vs Form Details & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forms List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
            <span>{t('نماذج الاستوديو', 'Forms List')}</span>
            <span className="font-mono text-neutral-400">({briefForms.length})</span>
          </div>

          <div className="space-y-2">
            {briefForms.map((form) => {
              const client = clients.find((c) => c.id === form.clientId);
              const isSelected = selectedForm?.id === form.id;
              const hasSubmission = Boolean(form.submissionId || briefSubmissions.some((s) => s.formId === form.id));

              return (
                <div
                  key={form.id}
                  onClick={() => handleSelectForm(form)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-neutral-900 leading-snug">{form.title}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0 ${
                        hasSubmission
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {hasSubmission ? t('تم استلام الإجابات', 'Submitted') : t('بانتظار العميل', 'Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{client?.company || client?.name || t('عام', 'General')}</span>
                    <span className="font-mono">{form.questions.length} {t('أسئلة', 'questions')}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyShareLink(form)}
                      className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                    >
                      <Copy size={12} />
                      <span>{t('نسخ الرابط', 'Copy Link')}</span>
                    </button>

                    <button
                      onClick={() => setPublicMode({ type: 'brief', token: form.shareToken })}
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

        {/* Right: Selected Form & Answers Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedForm ? (
            <div className="p-6 bg-white border border-neutral-200/80 rounded-xl space-y-6 shadow-xs">
              {/* Form Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{selectedForm.title}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{selectedForm.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteBriefForm(selectedForm.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t('حذف نموذج البريف', 'Delete Brief Form')}
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => copyShareLink(selectedForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <Copy size={13} />
                    <span>{t('نسخ الرابط العام', 'Copy Link')}</span>
                  </button>

                  <button
                    onClick={() => setPublicMode({ type: 'brief', token: selectedForm.shareToken })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
                  >
                    <ExternalLink size={13} />
                    <span>{t('فتح صفحة التعبئة', 'Fill Form')}</span>
                  </button>
                </div>
              </div>

              {/* Submissions Section */}
              {selectedSubmission ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-700" />
                      <div>
                        <span className="font-bold">{selectedSubmission.clientName} ({selectedSubmission.clientCompany})</span>
                        <div className="text-[11px] text-emerald-800 font-mono">{selectedSubmission.clientEmail}</div>
                      </div>
                    </div>
                    <div className="text-end font-mono text-[11px] text-emerald-800">
                      <div>{t('تاريخ الإرسال', 'Submitted At')}</div>
                      <div>{formatDate(selectedSubmission.submittedAt)}</div>
                    </div>
                  </div>

                  {/* Answers Accordion / List */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t('إجابات العميل الموثقة', 'Client Responses')}
                    </h4>

                    <div className="divide-y divide-neutral-100">
                      {selectedForm.questions.map((q, idx) => {
                        const answer = selectedSubmission.answers[q.id];
                        return (
                          <div key={q.id} className="py-3.5 space-y-1.5 first:pt-0">
                            <div className="flex items-start gap-2 text-xs">
                              <span className="font-mono text-neutral-400 shrink-0">{idx + 1}.</span>
                              <div className="font-semibold text-neutral-900">{t(q.title, q.titleEn)}</div>
                            </div>
                            <div className="ms-5 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                              {Array.isArray(answer) ? answer.join(' · ') : (answer || t('لم يتم تقديم إجابة', 'No answer'))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-50 rounded-xl space-y-3">
                  <Clock size={32} className="mx-auto text-neutral-400" />
                  <h4 className="text-sm font-bold text-neutral-900">{t('لم يتم إرسال الإجابات بعد', 'No responses submitted yet')}</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {t('شارك الرابط العام للنموذج مع العميل. يمكن للعميل تعبئة البيانات وحفظها دون الحاجة لتسجيل حساب.', 'Share the public link with your client. They can complete it without creating an account.')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-neutral-200/80 rounded-xl text-neutral-500 text-xs">
              {t('اختر نموذجاً من القائمة لعرض تفاصيله وإجابات العميل', 'Select a brief form to view')}
            </div>
          )}
        </div>
      </div>

      {/* New Form Modal */}
      {isNewFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">{t('إنشاء نموذج بريف جديد', 'New Brief Form')}</h3>
              <button onClick={() => setIsNewFormModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('عنوان النموذج *', 'Title *')}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: بريف استراتيجية متجر نماء"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('العميل المستهدف', 'Client')}</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                >
                  <option value="">{t('اختر العميل (اختياري)...', 'Select client (optional)...')}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('المشروع المرتبط', 'Project')}</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                >
                  <option value="">{t('اختر المشروع (اختياري)...', 'Select project (optional)...')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {t('إنشاء النموذج', 'Create Form')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
