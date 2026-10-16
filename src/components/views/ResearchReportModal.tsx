import React from 'react';
import {
  X,
  Printer,
  Compass,
  ArrowRight,
  ExternalLink,
  Building,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { ResearchWorkspace, Project, Client } from '../../types';

interface ResearchReportModalProps {
  research: ResearchWorkspace;
  project: Project;
  client?: Client;
  onClose: () => void;
}

export const ResearchReportModal: React.FC<ResearchReportModalProps> = ({
  research,
  project,
  client,
  onClose,
}) => {
  const { settings, formatDate, t } = useStudio();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Container - on print this becomes full-width uncontained sheet */}
      <div className="w-full max-w-4xl bg-white border border-neutral-300 rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden print-container">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              {t('معاينة تقرير البحث الاستراتيجي والمنافسين (PDF)', 'Strategic Research & Competitor Report Preview')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors shadow-sm"
            >
              <Printer size={15} />
              <span>{t('تصدير وطباعة PDF (عربي RTL سليم)', 'Export / Print PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Editorial Book Layout */}
        <div className="p-8 sm:p-14 space-y-12 bg-white text-neutral-900 text-sm leading-relaxed overflow-y-auto max-h-[85vh] print:max-h-none print:overflow-visible">
          {/* PAGE 1: COVER PAGE */}
          <div className="min-h-[500px] flex flex-col justify-between border-b pb-12 border-neutral-200">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                {settings.studioName} · {settings.studioNameEn}
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                Brand Strategy & Visual Audit Dossier
              </div>
            </div>

            <div className="space-y-4 my-12">
              <div className="inline-block text-xs font-mono px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-700">
                Strategic Research Document · وثيقة بحث استراتيجي
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 max-w-xl leading-tight">
                {project.name}
              </h1>
              <p className="text-base text-neutral-600 max-w-lg">
                {research.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-8 border-t border-neutral-200 text-neutral-600 font-mono">
              <div>
                <span className="text-neutral-400 block">{t('العميل', 'Client')}</span>
                <span className="font-bold text-neutral-900">{client?.company || client?.name || 'العميل'}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">{t('إعداد', 'Prepared By')}</span>
                <span className="font-bold text-neutral-900">{settings.ownerName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">{t('التاريخ', 'Date')}</span>
                <span className="text-neutral-900">{formatDate(research.updatedAt)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">{t('النسخة', 'Version')}</span>
                <span className="text-neutral-900">v1.2 (Final Audit)</span>
              </div>
            </div>
          </div>

          {/* PAGE 2: EXECUTIVE SUMMARY & RESEARCH GOALS */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>01. أهداف البحث ونطاق الدراسة</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              نبذة المشروع ومحاور الدراسة الاستراتيجية
            </h2>

            <p className="text-neutral-700 leading-relaxed">
              {research.marketOverview}
            </p>

            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                الأسئلة والأهداف الجوهرية للبحث:
              </h3>
              <ul className="space-y-2 text-xs text-neutral-700">
                {research.researchGoals.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-neutral-400 shrink-0">0{idx + 1}.</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PAGE 3: TARGET AUDIENCE & PERSONAS */}
          <div className="space-y-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>02. دراسة السوق وشريحة الجمهور المستهدف</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              سلوك الشراء والدوافع النفسية للجمهور المثالي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-neutral-900 block">السمات الديموغرافية والجغرافية</span>
                <p className="text-neutral-600 leading-relaxed">{research.targetAudience.demographics}</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-neutral-900 block">السمات السلوكية والنفسية (Psychographics)</span>
                <p className="text-neutral-600 leading-relaxed">{research.targetAudience.psychographics}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-900">أبرز تحديات ومخاوف الجمهور الحالية (Pain Points):</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {research.targetAudience.painPoints.map((p, idx) => (
                  <div key={idx} className="p-3 border border-neutral-200 rounded-lg text-neutral-700 bg-white">
                    <span className="font-mono text-neutral-400 block mb-1">تحدي #{idx + 1}</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PAGE 4: COMPETITOR COMPARISON MATRIX */}
          <div className="space-y-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>03. جدول المقارنة والتحليل التنافسي الشامل</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              مقارنة المنافسين المباشرين في السوق
            </h2>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">المنافس</th>
                    <th className="py-2.5 px-3 text-start">التموضع ورسالة العلامة</th>
                    <th className="py-2.5 px-3 text-start">الباليتة اللونية</th>
                    <th className="py-2.5 px-3 text-start">نبرة التواصل</th>
                    <th className="py-2.5 px-3 text-start">نقاط القوة</th>
                    <th className="py-2.5 px-3 text-start">نقاط الضعف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {research.competitors.map((comp) => (
                    <tr key={comp.id} className="align-top">
                      <td className="py-3 px-3 font-bold text-neutral-900 whitespace-nowrap">
                        <div>{comp.name}</div>
                        <span className="text-[10px] font-mono text-neutral-400">{comp.website}</span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 max-w-xs">{comp.positioning}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {comp.primaryColors.map((col, idx) => (
                            <div key={idx} className="w-4 h-4 rounded-sm border border-neutral-300" style={{ backgroundColor: col }} title={col} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-600">{comp.toneOfVoice}</td>
                      <td className="py-3 px-3 text-neutral-600">
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {comp.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {comp.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGE 5: VISUAL AUDIT & CLICHES TO AVOID */}
          <div className="space-y-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>04. التدقيق البصري والكليشيهات المستهلكة</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              الأنماط السائدة والرموز الواجب تجنبها
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
                <span className="font-bold text-rose-950 block">ممنوعات بصرية ينبغي تجنب تقليدها (Clichés):</span>
                <ul className="space-y-1.5 text-rose-900">
                  {research.visualPatterns.clichesToAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                <span className="font-bold text-emerald-950 block">فرص الجماليات الصاعدة المعتمدة:</span>
                <ul className="space-y-1.5 text-emerald-900">
                  {research.visualPatterns.emergingAesthetics.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* PAGE 6: BRAND NAME ETYMOLOGY & VISUAL OPPORTUNITIES */}
          <div className="space-y-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>05. تحليل اسم العلامة والارتباطات الذهنية</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              الجذور اللغوية وتحويل الاسم إلى فكرة بصرية
            </h2>

            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-neutral-900">أصل الاسم في المعاجم العربية:</span>
                <p className="text-neutral-700 leading-relaxed">{research.brandNameAnalysis.etymology}</p>
              </div>

              <div className="pt-2 border-t border-neutral-200 space-y-1">
                <span className="font-bold text-neutral-900">فرص الابتكار البصري للاسم:</span>
                <ul className="space-y-1 text-neutral-700">
                  {research.brandNameAnalysis.visualOpportunities.map((op, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-mono text-neutral-400">·</span>
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* PAGE 7: STRATEGIC OPPORTUNITIES & RECOMMENDATIONS */}
          <div className="space-y-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
              <span>06. التوصيات الاستراتيجية وقرارات التصميم</span>
            </div>

            <h2 className="text-xl font-bold text-neutral-950">
              ما الذي سنفعله في التصميم ولماذا؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-neutral-50/70">
                <span className="font-bold text-neutral-900 block">ما سنفعله في الهوية (Visual Strategy DO):</span>
                <ul className="space-y-1 text-neutral-700">
                  {research.strategicOpportunities.visualStrategyDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-neutral-50/70">
                <span className="font-bold text-neutral-900 block">ما سنتجنبه تماماً (Visual Strategy AVOID):</span>
                <ul className="space-y-1 text-neutral-700">
                  {research.strategicOpportunities.visualStrategyAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-700 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Document Footer Signoff */}
            <div className="pt-8 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-mono">
              <div>
                <span>وثيقة صادرة عن: {settings.studioName}</span>
              </div>
              <div>
                <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
