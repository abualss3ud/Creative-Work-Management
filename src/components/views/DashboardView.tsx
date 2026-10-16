import React from 'react';
import {
  FolderKanban,
  Users,
  FileText,
  Receipt,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Plus,
  CheckCircle2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Send,
  Eye,
  Shield,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { ActivityLog } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    metrics,
    projects,
    invoices,
    proposals,
    clients,
    settings,
    currentUser,
    isAdmin,
    activities,
    formatCurrency,
    formatDate,
    setCurrentTab,
    setSelectedProjectId,
    setSelectedClientId,
    setIsQuickCreateOpen,
    openReportForProject,
    setPublicMode,
    t,
  } = useStudio();

  const activeProjects = projects.filter((p) => p.status !== 'closed');
  
  // Pending Proposals (sent or viewed awaiting client approval)
  const pendingProposals = proposals.filter((p) => p.status === 'sent' || p.status === 'viewed');

  // Invoices: Overdue and Pending
  const today = new Date().toISOString().split('T')[0];
  const overdueInvoices = invoices.filter(
    (inv) => (inv.status === 'issued' || inv.status === 'partially_paid') && inv.dueDate < today
  );
  const pendingInvoices = invoices.filter(
    (inv) => (inv.status === 'issued' || inv.status === 'partially_paid') && inv.dueDate >= today
  );
  const allUnpaidInvoices = [...overdueInvoices, ...pendingInvoices];

  // Upcoming Deadlines: Project targets and Deliverable milestones sorted by date
  const upcomingDeadlines = projects
    .filter((p) => p.status !== 'closed')
    .map((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      const target = new Date(p.targetDate);
      const now = new Date();
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const currentStage = p.stages[p.currentStageIndex];

      return {
        id: p.id,
        projectName: p.name,
        clientName: client?.company || client?.name || 'عميل',
        serviceType: p.serviceType,
        targetDate: p.targetDate,
        diffDays,
        stageName: currentStage?.name || 'المرحلة الحالية',
        progress: p.progressPercentage,
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Editorial Studio Hero Banner with User Role Context */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-900 text-white shadow-xs">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/brandflow_studio_hero_1792158732035.jpg"
            alt="BrandFlow Studio"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-300">
            <span className="font-semibold text-white">محمد أبو السعود</span>
            <span aria-hidden="true">·</span>
            <span>{t('تصميم واستراتيجية الهويات البصرية', 'Brand Identity & Visual Design')}</span>
            <span aria-hidden="true">·</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider ${
              isAdmin ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
            }`}>
              {isAdmin ? t('المصمم والمالك (Owner / Admin)', 'Owner / Designer') : t('مساعد تصميم', 'Assistant')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {t(
              'مساحة العمل الاحترافية للمصمم محمد أبو السعود لإدارة وتطوير الهويات البصرية',
              'Mohamed Abu Al-Saud — Professional Brand Identity Management Workspace'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            {t(
              'مساحة عمل مخصصة تجمع كل دورة حياة مشاريع الهوية: استلام البريف، البحث الاستراتيجي، عروض الأسعار والاتفاقيات، الفواتير، وحتى تسليم الحزمة النهائية للعميل.',
              'Personal workspace powering end-to-end brand identity client lifecycle: intake briefs, market strategy, proposals, milestone billing, and final handover.'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuickCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors shadow-xs"
            >
              <Plus size={15} />
              <span>{t('مشروع أو عرض سعر جديد', 'New Project or Proposal')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('research')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors"
            >
              <span>{t('فتح مساحة البحث والاستراتيجية', 'Open Strategy Workspace')}</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={() => setCurrentTab('briefs')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <span>{t('نماذج واستبيانات البريف', 'Brief Questionnaires')}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Numerical Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div
          onClick={() => setCurrentTab('projects')}
          className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('المشاريع النشطة', 'Active Projects')}</span>
            <FolderKanban size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {activeProjects.length}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>{projects.length} {t('إجمالي المشاريع المسجلة', 'total projects')}</span>
          </div>
        </div>

        {/* Pending Proposals */}
        <div
          onClick={() => setCurrentTab('proposals')}
          className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('عروض تنتظر الموافقة', 'Pending Proposals')}</span>
            <FileText size={16} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {pendingProposals.length}
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {formatCurrency(pendingProposals.reduce((sum, p) => sum + p.totalAmount, 0))} {t('قيمة متوقعة', 'in pipeline')}
          </div>
        </div>

        {/* Overdue & Outstanding Receivables */}
        <div
          onClick={() => setCurrentTab('invoices')}
          className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('المبالغ المستحقة للتحصيل', 'Outstanding Receivables')}</span>
            <Receipt size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(metrics?.totalReceivables || 0)}
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1">
            {overdueInvoices.length > 0 ? (
              <span className="text-rose-700 font-medium flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>{overdueInvoices.length} {t('متأخرة عن الموعد', 'overdue')}</span>
              </span>
            ) : (
              <span className="text-neutral-500">
                {allUnpaidInvoices.length} {t('فواتير قيد التحصيل', 'invoices pending')}
              </span>
            )}
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div
          onClick={() => setCurrentTab('reports')}
          className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('الإيرادات المحصلة', 'Revenue Collected')}</span>
            <TrendingUp size={16} className="text-neutral-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(metrics?.totalRevenueYear || 0)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            {t('تم تحصيلها وتأكيدها بالحساب', 'Verified bank settlements')}
          </div>
        </div>
      </div>

      {/* Overdue Invoices Alert Section (if any overdue) */}
      {overdueInvoices.length > 0 && (
        <div className="p-4 sm:p-5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertTriangle size={16} className="text-rose-600" />
              <span>{t('تنبيه: فواتير متأخرة عن موعد السداد المحدد', 'Overdue Invoices Requiring Follow-up')}</span>
              <span className="bg-rose-200 text-rose-900 px-2 py-0.2 rounded-full font-mono text-[11px]">
                {overdueInvoices.length}
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('invoices')}
              className="text-xs font-medium text-rose-800 hover:text-rose-950 underline"
            >
              {t('عرض سجل الفواتير', 'View Invoices Ledger')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueInvoices.map((inv) => {
              const client = clients.find((c) => c.id === inv.clientId);
              const daysDiff = Math.ceil(
                (new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={inv.id}
                  className="p-3 bg-white border border-rose-200/80 rounded-lg flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">{inv.invoiceNumber}</span>
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[10px] font-semibold">
                        {t(`متأخرة بـ ${daysDiff} يوم`, `${daysDiff} days overdue`)}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 font-medium">{client?.company || client?.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      {t('استحقت بتاريخ:', 'Due on:')} {formatDate(inv.dueDate)}
                    </div>
                  </div>

                  <div className="text-end space-y-1.5">
                    <div className="font-mono font-bold text-rose-900 tabular-nums">
                      {formatCurrency(inv.balanceDue, inv.currency)}
                    </div>
                    <button
                      onClick={() => setPublicMode({ type: 'invoice', token: inv.id })}
                      className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>{t('رابط السداد', 'Pay Link')}</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 2-Column Split: Active Projects Pipeline & Side Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Projects Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">{t('المشاريع قيد التنفيذ', 'Active Projects Pipeline')}</h3>
              <span className="text-xs text-neutral-400 font-mono">({activeProjects.length})</span>
            </div>
            <button
              onClick={() => setCurrentTab('projects')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>{t('عرض كافة المشاريع', 'View All Projects')}</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {/* Active Projects Cards */}
          <div className="space-y-4">
            {activeProjects.map((project) => {
              const client = clients.find((c) => c.id === project.clientId);
              const currentStage = project.stages[project.currentStageIndex];

              return (
                <div
                  key={project.id}
                  className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-300 transition-all shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setCurrentTab('projects');
                          }}
                          className="text-sm font-bold text-neutral-900 hover:text-amber-800 transition-colors cursor-pointer"
                        >
                          {project.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.2 bg-neutral-100 text-neutral-700 font-mono rounded">
                          {project.id.replace('proj_', 'BF-').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{client?.company || client?.name || 'عميل'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.serviceType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-semibold text-neutral-800">
                          {formatCurrency(project.budget, project.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openReportForProject(project.id)}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                        title={t('معاينة وتصدير تقرير البحث PDF', 'Export Research PDF')}
                      >
                        {t('تقرير البحث PDF', 'Research PDF')}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setCurrentTab('projects');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                      >
                        {t('فتح المشروع', 'Open')}
                      </button>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-700 font-medium flex items-center gap-1.5">
                        <span className="text-neutral-400 font-mono text-[11px]">0{project.currentStageIndex + 1}.</span>
                        <span>{currentStage?.name || 'المرحلة'}</span>
                        {currentStage?.requiresClientApproval && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {t('تتطلب موافقة العميل', 'Approval Required')}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-neutral-700 font-semibold tabular-nums">{project.progressPercentage}%</span>
                    </div>

                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Micro Timeline Indicator */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{t('الموعد المستهدف للتسليم:', 'Target Handover:')}</span>
                      <span className="font-mono text-neutral-700 font-medium">{formatDate(project.targetDate)}</span>
                    </div>
                    <div>
                      <span>{t('جولات التعديل المستخدمة:', 'Revisions:')} </span>
                      <span className="font-mono text-neutral-700 font-medium">
                        {project.revisionsUsed} / {project.revisionsAllowed}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Proposals Dedicated Section */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">{t('عروض أسعار تنتظر موافقة العميل', 'Pending Proposals')}</h3>
                <span className="text-xs text-neutral-400 font-mono">({pendingProposals.length})</span>
              </div>
              <button
                onClick={() => setCurrentTab('proposals')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>{t('إدارة عروض الأسعار', 'Manage Proposals')}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {pendingProposals.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                {t('لا توجد عروض أسعار معلقة حاليًا', 'No proposals currently pending')}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {pendingProposals.map((prop) => {
                  const client = clients.find((c) => c.id === prop.clientId);
                  return (
                    <div key={prop.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">{prop.quoteNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            prop.status === 'viewed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {prop.status === 'viewed' ? t('تمت مشاهدته من العميل', 'Viewed by client') : t('تم الإرسال', 'Sent')}
                          </span>
                        </div>
                        <div className="font-medium text-neutral-800 truncate">{prop.title}</div>
                        <div className="text-[11px] text-neutral-500">{client?.company || client?.name}</div>
                      </div>

                      <div className="text-end shrink-0 space-y-1.5">
                        <div className="font-mono font-bold text-neutral-900 tabular-nums">
                          {formatCurrency(prop.totalAmount, prop.currency)}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setPublicMode({ type: 'proposal', token: prop.id })}
                            className="px-2 py-0.5 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={11} />
                            <span>{t('معاينة العميل', 'Preview')}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectId(prop.projectId || null);
                              setCurrentTab('proposals');
                            }}
                            className="px-2 py-0.5 text-[11px] font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded transition-colors"
                          >
                            {t('فتح', 'Open')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Recent Activities */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Section */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('المواعيد النهائية القادمة', 'Upcoming Deadlines')}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                {upcomingDeadlines.length} {t('مواعيد', 'due')}
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {upcomingDeadlines.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedProjectId(item.id);
                    setCurrentTab('projects');
                  }}
                  className="py-3 cursor-pointer hover:bg-neutral-50/70 transition-colors rounded-lg px-1.5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 truncate max-w-[170px]">
                      {item.projectName}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      item.diffDays <= 7
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.diffDays <= 14
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {item.diffDays <= 0
                        ? t('اليوم', 'Due Today')
                        : item.diffDays === 1
                        ? t('غدًا', 'Tomorrow')
                        : t(`متبقي ${item.diffDays} يوم`, `${item.diffDays} days left`)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{item.clientName}</span>
                    <span className="text-neutral-400 font-mono">{formatDate(item.targetDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 pt-0.5">
                    <span className="text-neutral-500">{t('المرحلة:', 'Stage:')}</span>
                    <span className="text-neutral-700 font-medium">{item.stageName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invoices Strip */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('فواتير مستحقة الدفع', 'Pending Invoices')}
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('invoices')}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                {t('عرض الكل', 'View all')}
              </button>
            </div>

            <div className="divide-y divide-neutral-100">
              {allUnpaidInvoices.slice(0, 4).map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                return (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <div className="font-mono font-medium text-neutral-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{client?.company || client?.name}</div>
                    </div>
                    <div className="text-end shrink-0 ms-2">
                      <div className="font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(inv.balanceDue, inv.currency)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {t('استحقاق:', 'Due:')} {formatDate(inv.dueDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Audit Log */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t('سجل الأنشطة المباشر', 'Live Activity Feed')}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live" />
            </div>

            <div className="space-y-3 text-xs">
              {(metrics?.recentActivities || activities).slice(0, 5).map((act: ActivityLog) => (
                <div key={act.id} className="flex items-start gap-2.5 pb-2.5 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="mt-1 shrink-0">
                    {act.actionType === 'payment' && <CreditCard size={13} className="text-emerald-600" />}
                    {act.actionType === 'approval' && <CheckCircle2 size={13} className="text-indigo-600" />}
                    {act.actionType === 'create' && <Plus size={13} className="text-neutral-700" />}
                    {act.actionType === 'update' && <Sparkles size={13} className="text-amber-600" />}
                    {!['payment', 'approval', 'create', 'update'].includes(act.actionType) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-neutral-900 truncate leading-tight">{act.action}</span>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal line-clamp-2 mt-0.5">{act.description}</p>
                    <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1 font-mono">
                      <span>{act.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
