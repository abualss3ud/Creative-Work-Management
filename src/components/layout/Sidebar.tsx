import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileQuestion,
  Compass,
  FileText,
  FileSignature,
  Receipt,
  PackageCheck,
  Library,
  BarChart3,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStudio, ActiveTab } from '../../context/StudioContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const {
    currentTab,
    setCurrentTab,
    projects,
    clients,
    proposals,
    invoices,
    briefForms,
    settings,
    language,
    t,
    setPublicMode,
  } = useStudio();

  const pendingProposalsCount = proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status === 'issued' || i.status === 'partially_paid').length;
  const activeProjectsCount = projects.filter((p) => p.status !== 'closed').length;

  const navItems: Array<{
    id: ActiveTab;
    labelAr: string;
    labelEn: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeType?: 'alert' | 'neutral';
  }> = [
    { id: 'dashboard', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', labelAr: 'العملاء', labelEn: 'Clients', icon: Users, badgeCount: clients.length },
    { id: 'projects', labelAr: 'المشاريع', labelEn: 'Projects', icon: FolderKanban, badgeCount: activeProjectsCount },
    { id: 'briefs', labelAr: 'نماذج البريف', labelEn: 'Brief Forms', icon: FileQuestion, badgeCount: briefForms.length },
    { id: 'research', labelAr: 'البحث والاستراتيجية', labelEn: 'Research & Strategy', icon: Compass },
    { id: 'proposals', labelAr: 'عروض الأسعار', labelEn: 'Proposals', icon: FileText, badgeCount: pendingProposalsCount, badgeType: 'alert' },
    { id: 'agreements', labelAr: 'الاتفاقيات', labelEn: 'Agreements', icon: FileSignature },
    { id: 'invoices', labelAr: 'الفواتير والمدفوعات', labelEn: 'Invoices & Payments', icon: Receipt, badgeCount: unpaidInvoicesCount, badgeType: 'alert' },
    { id: 'deliverables', labelAr: 'ملفات التسليم', labelEn: 'Deliverables', icon: PackageCheck },
    { id: 'templates', labelAr: 'مكتبة القوالب', labelEn: 'Templates', icon: Library },
    { id: 'reports', labelAr: 'التقارير', labelEn: 'Reports', icon: BarChart3 },
    { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col shrink-0 bg-white border-e border-neutral-200 transition-all duration-200 select-none z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Studio Header Brand Lockup */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 text-white shrink-0 font-bold text-xs tracking-tighter shadow-sm font-mono">
            <span>MA</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-neutral-900 truncate">
                محمد أبو السعود
              </span>
              <span className="text-[11px] text-neutral-500 truncate">
                {t('تصميم واستراتيجية هويات', 'Brand Identity Designer')}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          title={isCollapsed ? t('توسيع القائمة', 'Expand Sidebar') : t('طي القائمة', 'Collapse Sidebar')}
        >
          {isCollapsed ? (
            language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
          ) : (
            language === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title={isCollapsed ? t(item.labelAr, item.labelEn) : undefined}
            >
              <Icon
                size={18}
                className={`shrink-0 ${
                  isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-900'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 ms-3 overflow-hidden">
                  <span className="truncate whitespace-nowrap">{t(item.labelAr, item.labelEn)}</span>

                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`text-xs tabular-nums ms-2 font-mono ${
                        isActive
                          ? 'text-neutral-300'
                          : item.badgeType === 'alert'
                          ? 'text-amber-700 font-semibold'
                          : 'text-neutral-500'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area: Client Portal Quick Switcher */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/70">
        {isCollapsed ? (
          <button
            onClick={() => setPublicMode({ type: 'portal', token: projects[0]?.shareToken || 'demo' })}
            className="flex items-center justify-center w-full p-2 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg transition-colors border border-neutral-200"
            title={t('معاينة بوابة العميل', 'Preview Client Portal')}
          >
            <ExternalLink size={16} />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setPublicMode({ type: 'portal', token: projects[0]?.shareToken || 'demo' })}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <ExternalLink size={14} className="text-neutral-500" />
                <span>{t('معاينة بوابة العميل', 'Client Portal View')}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Live</span>
            </button>

            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span>{t('إصدار الاستوديو', 'Studio OS')} v1.0</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Sparkles size={11} />
                <span>{t('مزامنة فورية', 'Synced')}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
