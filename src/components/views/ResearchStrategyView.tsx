import React, { useState, useEffect } from 'react';
import {
  Compass,
  Building,
  Target,
  Sparkles,
  Layers,
  BookOpen,
  Plus,
  Save,
  Printer,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { ResearchWorkspace, Competitor } from '../../types';
import { api } from '../../services/api';
import { INITIAL_RESEARCH } from '../../services/mockData';
import { ResearchReportModal } from './ResearchReportModal';

export const ResearchStrategyView: React.FC = () => {
  const {
    projects,
    clients,
    selectedProjectId,
    setSelectedProjectId,
    openReportForProject,
    showToast,
    t,
  } = useStudio();

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeClient = clients.find((c) => c.id === activeProject?.clientId);

  const [research, setResearch] = useState<ResearchWorkspace>(INITIAL_RESEARCH);
  const [activeTab, setActiveTab] = useState<
    'summary' | 'audience' | 'competitors' | 'visuals' | 'naming' | 'recommendations'
  >('summary');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New competitor form state
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [newComp, setNewComp] = useState<Partial<Competitor>>({
    name: '',
    website: '',
    positioning: '',
    primaryColors: ['#1c1917', '#e7e5e4'],
    typography: 'Modern Sans',
    toneOfVoice: 'احترافي وودود',
    strengths: ['حضور قوي'],
    weaknesses: ['غياب التميز البصري'],
    sourceDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (activeProject) {
      api.getResearch(activeProject.id)
        .then((data) => setResearch(data))
        .catch(() => setResearch(INITIAL_RESEARCH));
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      await api.saveResearch(activeProject.id, research);
      showToast(t('تم حفظ بيانات البحث الاستراتيجي بنجاح', 'Research saved successfully'));
    } catch (err: any) {
      showToast(err.message || 'فشل الحفظ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCompetitor = () => {
    if (!newComp.name) return;
    const competitor: Competitor = {
      id: `comp-${Date.now()}`,
      name: newComp.name,
      website: newComp.website || '',
      positioning: newComp.positioning || '',
      logoAnalysis: 'شعار نصي حديث',
      primaryColors: newComp.primaryColors || ['#000000', '#ffffff'],
      typography: newComp.typography || '',
      packagingStyle: 'كرافت غير مصقول',
      toneOfVoice: newComp.toneOfVoice || '',
      strengths: newComp.strengths || [],
      weaknesses: newComp.weaknesses || [],
      sourceDate: newComp.sourceDate || new Date().toISOString().split('T')[0],
    };
    setResearch({
      ...research,
      competitors: [...research.competitors, competitor],
    });
    setIsAddingCompetitor(false);
    setNewComp({ name: '', website: '', positioning: '' });
  };

  const handleDeleteCompetitor = (id: string) => {
    setResearch({
      ...research,
      competitors: research.competitors.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Project Selector and Report Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('مساحة البحث الاستراتيجي وتحليل المنافسين', 'Brand Strategy & Competitor Audit')}</h2>
          <p className="text-xs text-neutral-500">
            {t('توثيق دراسة السوق والمنافسين والأنماط البصرية وتوليد تقرير الاستراتيجية المعتمد', 'Audit competitors, extract visual patterns, and generate strategic research reports')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Switcher */}
          <select
            value={activeProject?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            <Save size={14} />
            <span>{isSaving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التعديلات', 'Save')}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors shadow-xs"
          >
            <Printer size={14} className="text-amber-900" />
            <span>{t('معاينة وتصدير تقرير PDF', 'Export Report PDF')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-neutral-200 bg-white px-4 gap-2 overflow-x-auto text-xs rounded-xl shadow-xs">
        {[
          { id: 'summary', label: t('نبذة وأهداف البحث', 'Summary & Goals'), icon: BookOpen },
          { id: 'audience', label: t('السوق والجمهور', 'Market & Audience'), icon: Target },
          { id: 'competitors', label: t('تحليل المنافسين', 'Competitors Matrix'), icon: Building },
          { id: 'visuals', label: t('الأنماط البصرية والكليشيهات', 'Visual Audit'), icon: Layers },
          { id: 'naming', label: t('تحليل اسم العلامة', 'Brand Naming'), icon: Sparkles },
          { id: 'recommendations', label: t('الفرص والتوصيات', 'Strategic DO & DONT'), icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
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

      {/* Workspace Content Panels */}
      <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
        {/* TAB 1: SUMMARY & GOALS */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">
                {t('الملخص التنفيذي ونبذة المشروع', 'Executive Summary')}
              </label>
              <textarea
                rows={3}
                value={research.executiveSummary}
                onChange={(e) => setResearch({ ...research, executiveSummary: e.target.value })}
                className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">
                {t('وصف السوق والمشكلة التجارية', 'Market Context & Problem Statement')}
              </label>
              <textarea
                rows={4}
                value={research.marketOverview}
                onChange={(e) => setResearch({ ...research, marketOverview: e.target.value })}
                className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-900">
                {t('أهداف البحث والأسئلة الرئيسية (Research Objectives)', 'Research Goals')}
              </label>
              <div className="space-y-2">
                {research.researchGoals.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">0{idx + 1}.</span>
                    <input
                      type="text"
                      value={g}
                      onChange={(e) => {
                        const updated = [...research.researchGoals];
                        updated[idx] = e.target.value;
                        setResearch({ ...research, researchGoals: updated });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIENCE & MARKET */}
        {activeTab === 'audience' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  {t('السمات الديموغرافية والجغرافية للجمهور', 'Demographics')}
                </label>
                <textarea
                  rows={3}
                  value={research.targetAudience.demographics}
                  onChange={(e) =>
                    setResearch({
                      ...research,
                      targetAudience: { ...research.targetAudience, demographics: e.target.value },
                    })
                  }
                  className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  {t('السمات السلوكية والنفسية (Psychographics)', 'Psychographics')}
                </label>
                <textarea
                  rows={3}
                  value={research.targetAudience.psychographics}
                  onChange={(e) =>
                    setResearch({
                      ...research,
                      targetAudience: { ...research.targetAudience, psychographics: e.target.value },
                    })
                  }
                  className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">
                {t('سلوك الشراء والإنفاق وتوقعات الجودة', 'Buying Behavior & Expectations')}
              </label>
              <textarea
                rows={3}
                value={research.targetAudience.buyingBehavior}
                onChange={(e) =>
                  setResearch({
                    ...research,
                    targetAudience: { ...research.targetAudience, buyingBehavior: e.target.value },
                  })
                }
                className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: COMPETITORS MATRIX */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  {t('المنافسون المباشرون المسجلون للدراسة', 'Audited Competitors')} ({research.competitors.length})
                </h3>
                <span className="text-xs text-neutral-500">
                  {t('مقارنة التموضع، الألوان، الخطوط، والتغليف ونقاط القوة والضعف', 'Benchmarked against identity, palette, typography, and tone')}
                </span>
              </div>

              <button
                onClick={() => setIsAddingCompetitor(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Plus size={14} />
                <span>{t('إضافة منافس جديد', 'Add Competitor')}</span>
              </button>
            </div>

            {/* Editable Competitors Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-100 font-semibold text-neutral-700 border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{t('المنافس', 'Competitor')}</th>
                    <th className="py-2.5 px-3 text-start">{t('التموضع ورسالة العلامة', 'Positioning')}</th>
                    <th className="py-2.5 px-3 text-start">{t('الألوان والتايبوغرافي', 'Palette & Type')}</th>
                    <th className="py-2.5 px-3 text-start">{t('نقاط القوة', 'Strengths')}</th>
                    <th className="py-2.5 px-3 text-start">{t('نقاط الضعف', 'Weaknesses')}</th>
                    <th className="py-2.5 px-3 text-end">{t('حذف', 'Remove')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {research.competitors.map((comp) => (
                    <tr key={comp.id} className="align-top hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-neutral-900">{comp.name}</div>
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700 flex items-center gap-1 mt-0.5"
                        >
                          <span>{comp.website}</span>
                          <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 max-w-xs">{comp.positioning}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 mb-1">
                          {comp.primaryColors.map((col, idx) => (
                            <div key={idx} className="w-4 h-4 rounded-sm border border-neutral-300" style={{ backgroundColor: col }} />
                          ))}
                        </div>
                        <div className="text-[10px] text-neutral-500">{comp.typography}</div>
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {comp.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {comp.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                        </ul>
                      </td>
                      <td className="py-3 px-3 text-end">
                        <button
                          onClick={() => handleDeleteCompetitor(comp.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal for adding competitor */}
            {isAddingCompetitor && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <div className="font-bold text-xs text-neutral-900">{t('إدراج منافس جديد في جدول المقارنة', 'Add New Competitor')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newComp.name}
                    onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                    placeholder={t('اسم المنافس *', 'Competitor Name *')}
                    className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white"
                  />
                  <input
                    type="url"
                    value={newComp.website}
                    onChange={(e) => setNewComp({ ...newComp, website: e.target.value })}
                    placeholder={t('رابط الموقع أو الحساب', 'Website / Instagram')}
                    className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newComp.positioning}
                  onChange={(e) => setNewComp({ ...newComp, positioning: e.target.value })}
                  placeholder={t('وصف التموضع ورسالة العلامة والجمهور المستهدف لديهم...', 'Positioning description...')}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingCompetitor(false)}
                    className="px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200 rounded-md"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddCompetitor}
                    className="px-3 py-1 text-xs text-white bg-neutral-900 hover:bg-neutral-800 rounded-md font-medium"
                  >
                    {t('إضافة المنافس', 'Add')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VISUAL PATTERNS & CLICHES */}
        {activeTab === 'visuals' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
                <span className="font-bold text-xs text-rose-950 block">
                  {t('كليشيهات وممنوعات بصرية ينبغي تجنب تقليدها', 'Visual Clichés to Strictly Avoid')}
                </span>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {research.visualPatterns.clichesToAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <span className="font-bold text-xs text-emerald-950 block">
                  {t('جماليات واتجاهات مقترحة للعلامة', 'Emerging Aesthetics')}
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {research.visualPatterns.emergingAesthetics.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">
                {t('خامات التغليف والطباعة المعتمدة', 'Materials & Packaging Specs')}
              </label>
              <textarea
                rows={2}
                value={research.visualPatterns.materialsAndPackaging}
                onChange={(e) =>
                  setResearch({
                    ...research,
                    visualPatterns: { ...research.visualPatterns, materialsAndPackaging: e.target.value },
                  })
                }
                className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 5: BRAND NAMING */}
        {activeTab === 'naming' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">
                {t('معنى الاسم وجذوره اللغوية في المعجم العربي', 'Brand Name Etymology')}
              </label>
              <textarea
                rows={2}
                value={research.brandNameAnalysis.etymology}
                onChange={(e) =>
                  setResearch({
                    ...research,
                    brandNameAnalysis: { ...research.brandNameAnalysis, etymology: e.target.value },
                  })
                }
                className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-neutral-900 block">
                  {t('فرص تحويل الاسم إلى فكرة بصرية', 'Visual Translation Opportunities')}
                </span>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {research.brandNameAnalysis.visualOpportunities.map((op, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-neutral-400">·</span>
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-neutral-900 block">
                  {t('مخاطر التفسير الخاطئ أو اللبس الذهني', 'Risks & Misinterpretations')}
                </span>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {research.brandNameAnalysis.risksOrMisinterpretations.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-neutral-400">·</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-emerald-950 block">
                  {t('ما سنفعله في التصميم ولماذا؟ (Design DO)', 'What We Will Do (DO)')}
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {research.strategicOpportunities.visualStrategyDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-rose-950 block">
                  {t('ما سنتجنبه تماماً ولماذا؟ (Design AVOID)', 'What We Will Avoid (AVOID)')}
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {research.strategicOpportunities.visualStrategyAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-700 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Export Modal */}
      {isModalOpen && activeProject && (
        <ResearchReportModal
          research={research}
          project={activeProject}
          client={activeClient}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
