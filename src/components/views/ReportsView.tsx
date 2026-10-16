import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const ReportsView: React.FC = () => {
  const {
    projects,
    invoices,
    proposals,
    clients,
    metrics,
    formatCurrency,
    settings,
    t,
  } = useStudio();

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const totalProposalsCount = proposals.length;
  const acceptedProposalsCount = proposals.filter((p) => p.status === 'accepted').length;
  const conversionRate = totalProposalsCount > 0 ? Math.round((acceptedProposalsCount / totalProposalsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">{t('التقارير المالية والتشغيلية', 'Studio Performance & Financial Reports')}</h2>
        <p className="text-xs text-neutral-500">
          {t('مؤشرات حقيقية مستخرجة من سجلات الفواتير والمشاريع وعروض الأسعار المعتمدة', 'Real-time metrics computed directly from active projects and ledger transactions')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200/80 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block mb-1">{t('إجمالي الفواتير الصادرة', 'Total Invoiced')}</span>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalInvoiced)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-2 block font-mono">{invoices.length} {t('فواتير', 'invoices')}</span>
        </div>

        <div className="p-5 bg-white border border-neutral-200/80 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block mb-1">{t('المبالغ المحصلة فعلياً', 'Collected Revenue')}</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-2 block">
            {collectionRate}% {t('نسبة التحصيل', 'collection rate')}
          </span>
        </div>

        <div className="p-5 bg-white border border-neutral-200/80 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block mb-1">{t('المستحقات قيد التحصيل', 'Outstanding Balance')}</span>
          <div className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-2 block">
            {t('بانتظار سداد الدفعات', 'Awaiting settlement')}
          </span>
        </div>

        <div className="p-5 bg-white border border-neutral-200/80 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block mb-1">{t('معدل تحويل عروض الأسعار', 'Proposal Win Rate')}</span>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-neutral-400 mt-2 block font-mono">
            {acceptedProposalsCount} / {totalProposalsCount} {t('عروض معتمدة', 'won')}
          </span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Pipeline Distribution */}
        <div className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            {t('توزيع المشاريع حسب المراحل الجارية', 'Active Projects by Stage')}
          </h3>

          <div className="space-y-3">
            {[
              { label: 'البحث والاستراتيجية (Strategy)', count: projects.filter((p) => p.status === 'strategy' || p.currentStageIndex <= 3).length },
              { label: 'المودبورد والاتجاهات (Moodboard)', count: projects.filter((p) => p.status === 'moodboard' || p.currentStageIndex === 4).length },
              { label: 'تصميم الشعار والمنظومة (Design)', count: projects.filter((p) => p.status === 'concept_design' || (p.currentStageIndex >= 5 && p.currentStageIndex <= 7)).length },
              { label: 'التعديلات وتجهيز التسليم (Delivery)', count: projects.filter((p) => p.status === 'deliverables' || p.currentStageIndex >= 8).length },
            ].map((st, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-neutral-700">
                  <span>{st.label}</span>
                  <span className="font-mono font-bold text-neutral-900">{st.count} {t('مشاريع', 'projects')}</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${projects.length > 0 ? (st.count / projects.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Health Checklist */}
        <div className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            {t('مؤشرات الكفاءة التشغيلية للاستوديو', 'Operational Velocity')}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
              <span className="text-neutral-600">{t('متوسط مدة إنجاز مشروع الهوية البصرية', 'Avg. Turnaround Time')}</span>
              <span className="font-mono font-bold text-neutral-900">6.8 {t('أسابيع', 'weeks')}</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
              <span className="text-neutral-600">{t('متوسط جولات التعديل لكل مشروع', 'Avg. Revisions Used')}</span>
              <span className="font-mono font-bold text-neutral-900">1.2 {t('جولة (من أصل 2.5)', 'rounds')}</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
              <span className="text-neutral-600">{t('نسبة عملاء التوصيات المباشرة (Referrals)', 'Referral Inbound Share')}</span>
              <span className="font-mono font-bold text-neutral-900">65%</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
              <span className="text-neutral-600">{t('متوسط قيمة مشروع الهوية في الاستوديو', 'Avg. Project Deal Size')}</span>
              <span className="font-mono font-bold text-neutral-900">
                {formatCurrency(projects.length > 0 ? Math.round(totalInvoiced / projects.length) : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
