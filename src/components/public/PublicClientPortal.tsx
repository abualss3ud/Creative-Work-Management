import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  Receipt,
  Download,
  Palette,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PublicClientPortal: React.FC = () => {
  const {
    projects,
    clients,
    proposals,
    invoices,
    briefForms,
    briefSubmissions,
    settings,
    setPublicMode,
    formatCurrency,
    formatDate,
    showToast,
    t,
  } = useStudio();

  // Find the primary demo project or selected project
  const project = projects[0];
  const client = clients.find((c) => c.id === project?.clientId);
  const proposal = proposals.find((p) => p.projectId === project?.id || p.clientId === client?.id);
  const projectInvoices = invoices.filter((i) => i.projectId === project?.id || i.clientId === client?.id);
  const briefForm = briefForms.find((b) => b.projectId === project?.id);
  const submission = briefSubmissions.find((s) => s.projectId === project?.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'moodboard' | 'invoices' | 'deliverables'>('overview');

  const currentStage = project?.stages[project.currentStageIndex];

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 pb-16 font-sans">
      {/* Top Banner Notice with Return to Studio */}
      <div className="bg-neutral-900 text-white px-4 py-2.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>
            {t(
              'أنت الآن في وضع "بوابة العميل الخارجية" (Client Portal Preview) — معزولة وآمنة تماماً للعميل',
              'You are viewing the external Secure Client Portal'
            )}
          </span>
        </div>
        <button
          onClick={() => setPublicMode({ type: null, token: null })}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{t('العودة للوحة تحكم الاستوديو', 'Back to Studio OS')}</span>
        </button>
      </div>

      {/* Main Portal Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Brand Header */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                B
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{project?.name}</h1>
                <div className="text-xs text-neutral-500 font-mono">
                  {client?.company} · {t('بوابة العميل المعتمدة', 'Client Portal')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-neutral-400 block">{t('الاستوديو المشرف', 'Studio')}</span>
              <span className="font-bold text-neutral-900 font-sans">{settings.studioName}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-neutral-400 block">{t('نسبة الإنجاز', 'Overall Progress')}</span>
              <span className="font-bold text-neutral-900">{project?.progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="flex border-b border-neutral-200 bg-white px-4 gap-2 overflow-x-auto text-xs rounded-xl shadow-xs">
          {[
            { id: 'overview', label: t('نظرة عامة والمراحل', 'Project Overview'), icon: FolderKanban },
            { id: 'moodboard', label: t('الاتجاهات البصرية المعتمدة', 'Visual Identity'), icon: Palette },
            { id: 'invoices', label: t('الفواتير والمدفوعات', 'Invoices & Payments'), icon: Receipt },
            { id: 'deliverables', label: t('الملفات والأصول للتحميل', 'Deliverables Download'), icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Project Overview & Stages */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Stage Highlight */}
            <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                    {t('المرحلة الحالية في المشروع', 'Current Phase')}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                    0{project ? project.currentStageIndex + 1 : 1}. {currentStage?.name}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-white">
                  {project?.progressPercentage}% {t('مكتمل', 'Complete')}
                </span>
              </div>

              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                  style={{ width: `${project?.progressPercentage}%` }}
                />
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentStage?.description}
              </p>
            </div>

            {/* Stages Timeline List */}
            <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t('مراحل وخريطة عمل الهوية البصرية', 'Brand Roadmap')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project?.stages.map((st, idx) => (
                  <div
                    key={st.id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between text-xs ${
                      st.isCompleted
                        ? 'bg-neutral-50/70 border-neutral-200 text-neutral-600'
                        : idx === project.currentStageIndex
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950 font-semibold'
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono ${
                          st.isCompleted
                            ? 'bg-neutral-900 text-white'
                            : idx === project.currentStageIndex
                            ? 'bg-amber-700 text-white'
                            : 'border border-neutral-300 text-neutral-400'
                        }`}
                      >
                        {st.isCompleted ? <CheckCircle2 size={12} /> : idx + 1}
                      </div>
                      <span>{st.name}</span>
                    </div>

                    <span className="text-[10px] font-mono">
                      {st.isCompleted ? t('معتمدة', 'Done') : t('قيد العمل', 'Pending')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Moodboard */}
        {activeTab === 'moodboard' && (
          <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {t('الاتجاه البصري المعتمد لمشروع محامص قِمة', 'Approved Visual Direction')}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t('الحرفية الهادئة (Artisanal Warmth) — تم اعتماد هذا المسار لتطوير الشعار والعبوات', 'Approved direction for packaging, logo typography, and textures')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src="/src/assets/images/moodboard_coffee_roastery_1792158732658.jpg"
                    alt="Packaging mockup"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-xs font-semibold text-neutral-800">
                  {t('نموذج أكياس البن الحرفية غير المصقولة مع الختم المذهب', 'Craft pouch with debossed gold foil emblem')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src="/src/assets/images/brandflow_studio_hero_1792158732035.jpg"
                    alt="Stationery stationery"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-xs font-semibold text-neutral-800">
                  {t('القرطاسية، بطاقات الولاء، وأختام الشمع', 'Stationery system & wax seal')}
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-neutral-900 block">{t('الباليتة اللونية المعتمدة للعلامة:', 'Color Palette:')}</span>
              <div className="flex items-center gap-2">
                {[
                  { col: '#1A1817', name: 'أسود فحمي' },
                  { col: '#E8E5DF', name: 'أبيض عاجي' },
                  { col: '#C5A880', name: 'ذهبي مطفي' },
                  { col: '#54504A', name: 'رمادي حجري' },
                ].map((item) => (
                  <div key={item.col} className="flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] font-mono">
                    <div className="w-5 h-5 rounded-md border border-neutral-300" style={{ backgroundColor: item.col }} />
                    <span className="text-neutral-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{t('فواتيرك ومدفوعات المشروع', 'Billing & Invoices')}</h3>
              <p className="text-xs text-neutral-500">{t('كافة الفواتير الصادرة وسجلات التحويلات المعتمدة', 'View invoices and payment receipts')}</p>
            </div>

            <div className="space-y-3">
              {projectInvoices.map((inv) => (
                <div key={inv.id} className="p-4 border border-neutral-200 rounded-xl flex items-center justify-between text-xs bg-white">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono font-bold text-neutral-900">
                      <span>{inv.invoiceNumber}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-sans font-medium text-neutral-700">{inv.title}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {t('استحقاق:', 'Due:')} {formatDate(inv.dueDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-end font-mono">
                      <div className="font-bold text-neutral-900">{formatCurrency(inv.totalAmount, inv.currency)}</div>
                      <div className="text-[11px]">
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
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      {t('عرض الفاتورة', 'View')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Deliverables Download */}
        {activeTab === 'deliverables' && (
          <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{t('أصول الهوية والملفات المعتمدة للتنزيل', 'Master Deliverables Download')}</h3>
              <p className="text-xs text-neutral-500">{t('ملفات الشعارات المتجهية المفتوحة وأدلة الاستخدام الجاهزة للطباعة والإنتاج', 'Download print-ready master vectors and brand manuals')}</p>
            </div>

            <div className="space-y-3">
              {[
                { title: 'حزمة الشعارات المكتملة (Master Vector Logos)', format: 'AI / SVG / EPS', size: '42.5 MB' },
                { title: 'دليل الهوية البصرية الشامل (Brand Guidelines PDF)', format: 'PDF', size: '18.2 MB' },
                { title: 'ملفات قوالب الطباعة لأكياس القهوة (Dielines & Packaging)', format: 'PDF / AI', size: '35.8 MB' },
              ].map((del, idx) => (
                <div key={idx} className="p-4 border border-neutral-200 rounded-xl flex items-center justify-between text-xs bg-white">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-neutral-900">{del.title}</h4>
                    <span className="text-[11px] font-mono text-neutral-400">{del.format} · {del.size}</span>
                  </div>

                  <button
                    onClick={() => showToast(t(`جارٍ تنزيل ${del.title}`, `Downloading ${del.title}`))}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Download size={13} />
                    <span>{t('تنزيل الملف', 'Download')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
