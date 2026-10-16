import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  FileText,
  Compass,
  Palette,
  PackageCheck,
  Receipt,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { Project } from '../../types';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const {
    clients,
    invoices,
    proposals,
    agreements,
    briefForms,
    briefSubmissions,
    updateProjectStage,
    updateProject,
    deleteProject,
    formatCurrency,
    formatDate,
    openReportForProject,
    setCurrentTab,
    setPublicMode,
    showToast,
    t,
  } = useStudio();

  const [activeTab, setActiveTab] = useState<
    'stages' | 'brief' | 'finance' | 'moodboard' | 'deliverables' | 'revisions'
  >('stages');

  const client = clients.find((c) => c.id === project.clientId);
  const clientBriefForm = briefForms.find((f) => f.projectId === project.id || f.id === project.briefFormId);
  const briefSubmission = briefSubmissions.find(
    (s) => s.projectId === project.id || s.id === project.briefSubmissionId || s.formId === clientBriefForm?.id
  );
  const projectInvoices = invoices.filter((i) => project.invoiceIds.includes(i.id) || i.projectId === project.id);
  const projectProposal = proposals.find((p) => p.id === project.proposalId || p.projectId === project.id);
  const projectAgreement = agreements.find((a) => a.id === project.agreementId || a.projectId === project.id);

  const handleToggleStage = async (stageIndex: number, currentVal: boolean) => {
    await updateProjectStage(project.id, stageIndex, !currentVal);
  };

  const copyClientPortalLink = () => {
    const url = `${window.location.origin}/?view=portal&token=${project.shareToken}`;
    navigator.clipboard.writeText(url);
    showToast(t('تم نسخ رابط بوابة العميل إلى الحافظة', 'Client portal link copied to clipboard'));
  };

  const handleDelete = async () => {
    if (window.confirm(t('هل أنت متأكد من حذف هذا المشروع نهائياً؟', 'Are you sure you want to permanently delete this project?'))) {
      await deleteProject(project.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">{project.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-sm bg-neutral-900 text-white font-mono">
                {project.progressPercentage}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700">{client?.company || client?.name}</span>
              <span aria-hidden="true">·</span>
              <span>{project.serviceType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{formatCurrency(project.budget, project.currency)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openReportForProject(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors shadow-xs"
            >
              <Compass size={14} className="text-amber-700" />
              <span>{t('تقرير البحث PDF', 'Research PDF')}</span>
            </button>

            <button
              onClick={() => setPublicMode({ type: 'portal', token: project.shareToken })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors shadow-xs"
              title={t('معاينة بوابة العميل', 'Preview Client Portal')}
            >
              <ExternalLink size={14} />
              <span>{t('بوابة العميل', 'Client Portal')}</span>
            </button>

            <button
              onClick={copyClientPortalLink}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title={t('نسخ رابط العميل', 'Copy Link')}
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title={t('حذف المشروع', 'Delete Project')}
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-100 bg-white px-6 gap-2 overflow-x-auto text-xs">
          {[
            { id: 'stages', label: t('مراحل العمل الـ 12', '12 Project Stages'), icon: CheckCircle2 },
            { id: 'brief', label: t('إجابات البريف', 'Client Brief'), icon: FileText },
            { id: 'finance', label: t('العروض والفواتير', 'Proposals & Invoices'), icon: Receipt },
            { id: 'moodboard', label: t('لوحة المودبورد', 'Moodboard'), icon: Palette },
            { id: 'deliverables', label: t('أصول التسليم', 'Deliverables'), icon: PackageCheck },
            { id: 'revisions', label: t('جولات التعديل', 'Revisions'), icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: 12 STAGES TRACKER */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs text-neutral-500">
                  {t('اضغط على المربع لتأكيد إنجاز أو اعتماد كل مرحلة في دورة حياة الهوية البصرية', 'Check to complete stages with real progress recalculation')}
                </span>
                <span className="text-xs font-mono font-semibold text-neutral-900">
                  {project.stages.filter((s) => s.isCompleted).length} / {project.stages.length} {t('مكتملة', 'done')}
                </span>
              </div>

              <div className="space-y-2">
                {project.stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      stage.isCompleted
                        ? 'bg-neutral-50/70 border-neutral-200/80 text-neutral-600'
                        : idx === project.currentStageIndex
                        ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStage(idx, stage.isCompleted)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          stage.isCompleted
                            ? 'bg-neutral-900 text-white'
                            : 'border border-neutral-300 hover:border-neutral-500 bg-white'
                        }`}
                      >
                        {stage.isCompleted && <CheckCircle2 size={14} />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400">0{stage.order}.</span>
                          <span className={`text-xs font-semibold ${stage.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                            {t(stage.name, stage.nameEn)}
                          </span>
                          {stage.requiresClientApproval && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {t('موافقة عميل', 'Approval')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500">{stage.description}</p>
                      </div>
                    </div>

                    <div className="text-end text-[11px] font-mono text-neutral-400 shrink-0 ms-3">
                      {stage.completedAt ? (
                        <span className="text-neutral-600">{formatDate(stage.completedAt)}</span>
                      ) : (
                        <span>{t('معلقة', 'Pending')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT BRIEF ANSWERS */}
          {activeTab === 'brief' && (
            <div className="space-y-6">
              {briefSubmission ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-neutral-900">{briefSubmission.clientName} ({briefSubmission.clientCompany})</div>
                      <div className="text-neutral-500 font-mono mt-0.5">{briefSubmission.clientEmail}</div>
                    </div>
                    <div className="text-end text-neutral-500">
                      <div>{t('تاريخ الإرسال:', 'Submitted:')}</div>
                      <div className="font-mono text-neutral-900 font-semibold">{formatDate(briefSubmission.submittedAt)}</div>
                    </div>
                  </div>

                  <div className="space-y-4 divide-y divide-neutral-100">
                    {clientBriefForm?.questions.map((q) => {
                      const answer = briefSubmission.answers[q.id];
                      return (
                        <div key={q.id} className="pt-4 first:pt-0 space-y-1.5">
                          <div className="text-xs font-bold text-neutral-900">
                            {t(q.title, q.titleEn)}
                          </div>
                          {q.description && (
                            <div className="text-[11px] text-neutral-400">{q.description}</div>
                          )}
                          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                            {Array.isArray(answer) ? answer.join(' · ') : (answer || t('لم يتم تقديم إجابة', 'No answer provided'))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-50 rounded-xl space-y-3">
                  <FileText size={32} className="mx-auto text-neutral-400" />
                  <h4 className="text-sm font-bold text-neutral-900">{t('بانتظار تعبئة نموذج البريف', 'Awaiting Brief Submission')}</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {t('تم إنشاء رابط البريف للعميل. يمكنك نسخ الرابط وإرساله للعميل لتعبئته بدون تسجيل دخول.', 'Share the unique brief link with your client.')}
                  </p>
                  {clientBriefForm && (
                    <button
                      onClick={() => setPublicMode({ type: 'brief', token: clientBriefForm.shareToken })}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
                    >
                      {t('فتح نموذج البريف للعميل', 'Open Client Brief Form')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSALS & INVOICES */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Proposal Summary */}
              {projectProposal && (
                <div className="p-5 border border-neutral-200 rounded-xl space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase">
                        {projectProposal.quoteNumber}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">{projectProposal.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-medium">
                      {projectProposal.status === 'accepted' ? t('معتمد من العميل', 'Accepted') : projectProposal.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <span className="text-neutral-500">{t('المبلغ الإجمالي', 'Total')}</span>
                      <div className="font-mono font-bold text-neutral-900">{formatCurrency(projectProposal.totalAmount, projectProposal.currency)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('الضريبة (15%)', 'VAT')}</span>
                      <div className="font-mono text-neutral-900">{formatCurrency(projectProposal.taxAmount, projectProposal.currency)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('الجدول الزمني', 'Timeline')}</span>
                      <div className="text-neutral-900">{projectProposal.estimatedTimelineWeeks} {t('أسابيع', 'weeks')}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('المعتمد', 'Signee')}</span>
                      <div className="text-neutral-900">{projectProposal.acceptedByName || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoices List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('فواتير المشروع', 'Project Invoices')} ({projectInvoices.length})
                </h4>

                <div className="space-y-2">
                  {projectInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 border border-neutral-200 rounded-xl flex items-center justify-between text-xs bg-white">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">{inv.invoiceNumber}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="font-medium text-neutral-700">{inv.title}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {t('تاريخ الاستحقاق:', 'Due:')} <span className="font-mono">{formatDate(inv.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-end">
                          <div className="font-mono font-bold text-neutral-900">{formatCurrency(inv.totalAmount, inv.currency)}</div>
                          <div className="text-[11px] font-mono text-neutral-500">
                            {inv.status === 'paid' ? (
                              <span className="text-emerald-700 font-semibold">{t('مدفوعة بالكامل', 'Paid')}</span>
                            ) : (
                              <span className="text-amber-700 font-medium">
                                {t('المتبقي:', 'Due:')} {formatCurrency(inv.balanceDue, inv.currency)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setPublicMode({ type: 'invoice', token: inv.shareToken })}
                          className="px-2.5 py-1 text-xs border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                          {t('عرض الفاتورة', 'View')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOODBOARD & VISUAL DIRECTIONS */}
          {activeTab === 'moodboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{t('الاتجاهات البصرية والمودبورد', 'Visual Directions & Moodboard')}</h4>
                  <p className="text-xs text-neutral-500">{t('استعراض المراجع الفنية والبالتات اللونية المعتمدة', 'Visual style references and approved color systems')}</p>
                </div>
                <button
                  onClick={() => setCurrentTab('research')}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  {t('فتح في مساحة البحث الكاملة', 'Open in Research Workspace')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-xl overflow-hidden p-4 space-y-3 bg-white">
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src="/src/assets/images/moodboard_coffee_roastery_1792158732658.jpg"
                      alt="Coffee Roastery Packaging"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900">الاتجاه المعتمد: الحرفية الهادئة (Artisanal Craft)</h5>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      الاعتماد على أكياس الكرافت غير المصقولة مع طباعة ختم ذهبي مطفي لإبراز الجودة الحرفية.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    {['#1A1817', '#E8E5DF', '#C5A880', '#54504A'].map((col) => (
                      <div key={col} className="w-6 h-6 rounded-md border border-neutral-300" style={{ backgroundColor: col }} title={col} />
                    ))}
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden p-4 space-y-3 bg-white">
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src="/src/assets/images/brandflow_studio_hero_1792158732035.jpg"
                      alt="Stationery and guidelines"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900">تطبيقات المطبوعات والختم الشمعي</h5>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      بطاقات الملاحظات والمنيو وكروت الولاء مع مونوغرام القاف الدائري.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">{t('الملفات المصدرية والنهائية المتاحة للتنزيل للعميل', 'Master files and production exports')}</span>
                <button
                  onClick={() => setCurrentTab('deliverables')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>{t('إضافة ملف تسليم', 'Add Deliverable')}</span>
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'حزمة الشعارات المكتملة (Master Vector Logos)', format: 'AI / SVG / EPS', size: '42.5 MB' },
                  { title: 'دليل الهوية البصرية الشامل (Brand Guidelines PDF)', format: 'PDF', size: '18.2 MB' },
                  { title: 'ملفات قوالب الطباعة لأكياس القهوة (Dielines & Packaging)', format: 'PDF / AI', size: '35.8 MB' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-neutral-200 rounded-xl flex items-center justify-between text-xs bg-white">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-neutral-900">{item.title}</div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {item.format} · {item.size}
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(t(`جارٍ تنزيل ${item.title}`, `Downloading ${item.title}`))}
                      className="px-3 py-1 text-xs border border-neutral-200 hover:bg-neutral-100 rounded-md font-medium text-neutral-700 transition-colors"
                    >
                      {t('تنزيل', 'Download')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVISIONS */}
          {activeTab === 'revisions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl text-xs">
                <span>{t('جولات التعديل المستهلكة:', 'Revisions used:')} <strong className="font-mono">{project.revisionsUsed} / {project.revisionsAllowed}</strong></span>
                <span className="text-neutral-500">{t('المتبقي:', 'Remaining:')} <strong className="font-mono">{project.revisionsAllowed - project.revisionsUsed}</strong> {t('جولات', 'rounds')}</span>
              </div>

              <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-white text-xs">
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>{t('الجولة رقم 1 (قيد التنفيذ)', 'Round 1 (In Progress)')}</span>
                  <span className="font-mono text-neutral-400">2026-10-11</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  "نود تجربة تصغير سمك خط حلقة الشعار الخارجية بنسبة 15% للتأكد من سهولة وضوحها عند الطباعة على الأكواب الصغيرة، مع إضافة سنة التأسيس 2021 في أسفل الختم."
                </p>
                <div className="pt-2 text-[11px] text-amber-800 font-medium">
                  {t('ملاحظة المصمم: تم تجهيز التعديلات المطلوبة وجارٍ تصدير نماذج العرض النهائي للمراجعة.', 'Designer: Changes prepared and waiting for review deck export.')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
