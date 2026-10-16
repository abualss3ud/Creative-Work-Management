import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  X,
  UserPlus,
  LogOut,
  KeyRound,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const Header: React.FC = () => {
  const {
    currentTab,
    language,
    setLanguage,
    t,
    setIsQuickCreateOpen,
    setIsCommandPaletteOpen,
    settings,
    activities,
    projects,
    currentUser,
    isAdmin,
    switchUserDemo,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useStudio();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close notifications and profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabTitles: Record<string, { ar: string; en: string }> = {
    dashboard: { ar: 'لوحة التحكم والمؤشرات', en: 'Dashboard & Overview' },
    clients: { ar: 'إدارة العملاء CRM', en: 'Clients Management' },
    projects: { ar: 'المشاريع ومراحل التنفيذ', en: 'Projects & Stages' },
    briefs: { ar: 'نماذج البريف والاستبيانات', en: 'Brief Questionnaires' },
    research: { ar: 'البحث الاستراتيجي والمنافسين', en: 'Research & Strategy Workspace' },
    proposals: { ar: 'عروض الأسعار والمقترحات', en: 'Proposals & Quotations' },
    agreements: { ar: 'الاتفاقيات والشروط التعاقدية', en: 'Agreements & Terms' },
    invoices: { ar: 'الفواتير وسجل المدفوعات', en: 'Invoices & Payments Ledger' },
    deliverables: { ar: 'ملفات التسليم والأصول النهائية', en: 'Deliverables & Master Files' },
    templates: { ar: 'مكتبة القوالب الجاهزة', en: 'Templates Library' },
    reports: { ar: 'التقارير المالية والأداء', en: 'Financial & Operational Reports' },
    settings: { ar: 'إعدادات الاستوديو والهوية', en: 'Studio Settings' },
  };

  const currentTitle = tabTitles[currentTab] || { ar: 'استوديو مدار', en: 'Madar Studio' };

  return (
    <header className="h-16 px-6 bg-white border-b border-neutral-200 flex items-center justify-between gap-6 shrink-0 z-10 select-none">
      {/* Zone 1: Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-semibold text-neutral-900 truncate">
          {t(currentTitle.ar, currentTitle.en)}
        </h1>
        <span className="hidden sm:inline-block text-neutral-300">/</span>
        <span className="hidden sm:inline-block text-xs text-neutral-500 font-mono">
          {projects.length} {t('مشاريع', 'projects')}
        </span>
      </div>

      {/* Zone 2: Actions & Profile */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
          title={t('تغيير اللغة', 'Toggle Language')}
        >
          <Globe size={14} className="text-neutral-500" />
          <span className="font-sans">{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            title={t('الإشعارات', 'Notifications')}
          >
            <Bell size={18} />
            {activities.length > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-lg p-0 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">{t('آخر الأنشطة والتنبيهات', 'Recent Activities')}</span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    {t('لا توجد إشعارات حديثة', 'No recent notifications')}
                  </div>
                ) : (
                  activities.slice(0, 6).map((act) => (
                    <div key={act.id} className="p-3.5 hover:bg-neutral-50/70 transition-colors flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {act.actionType === 'payment' && <CreditCard size={15} className="text-emerald-600" />}
                        {act.actionType === 'approval' && <CheckCircle2 size={15} className="text-indigo-600" />}
                        {act.actionType === 'create' && <FileText size={15} className="text-amber-600" />}
                        {act.actionType === 'status_change' && <AlertCircle size={15} className="text-neutral-600" />}
                        {!['payment', 'approval', 'create', 'status_change'].includes(act.actionType) && (
                          <Bell size={15} className="text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-900">{act.action}</div>
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{act.description}</p>
                        <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: + جديد */}
        <button
          onClick={() => setIsQuickCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus size={15} />
          <span>{t('إنشاء جديد', 'New Entry')}</span>
        </button>

        {/* User Profile & Auth Menu */}
        <div className="relative ps-2 border-s border-neutral-200 shrink-0" ref={profileMenuRef}>
          {currentUser ? (
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors text-start"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                {isAdmin ? (
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" title={t('مدير نظام', 'Admin')} />
                ) : (
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white" title={t('عضو استوديو', 'Member')} />
                )}
              </div>

              <div className="hidden xl:flex flex-col text-start pe-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-neutral-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                    isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {isAdmin ? t('مدير', 'Admin') : t('عضو', 'Member')}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 leading-tight">
                  {currentUser.title || (isAdmin ? t('المدير الإبداعي', 'Creative Director') : t('مصممة هويات', 'Brand Designer'))}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <KeyRound size={14} />
              <span>{t('تسجيل الدخول', 'Sign In')}</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && currentUser && (
            <div className="absolute end-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">{currentUser.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {isAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono truncate">{currentUser.email}</div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  {isAdmin
                    ? t('صلاحيات كاملة: تعديل الإعدادات والماليات وحذف السجلات', 'Full access: settings, financials & deletions')
                    : t('صلاحيات مصمم: إنشاء المشاريع والبريف وعروض الأسعار', 'Designer access: projects, briefs & proposals')}
                </div>
              </div>

              {/* Demo Switcher */}
              <div className="p-2 space-y-1.5 border-t border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  {t('تبديل سريع للمستخدم (تجربة RBAC)', 'Switch Demo Role')}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      switchUserDemo('admin');
                      setIsProfileMenuOpen(false);
                    }}
                    className={`p-2 text-start rounded-lg text-xs font-medium border transition-colors ${
                      isAdmin ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Shield size={12} className={isAdmin ? 'text-amber-400' : 'text-neutral-500'} />
                      <span>{t('محمد أبو السعود', 'Mohamed Abu Al-Saud')}</span>
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5 truncate">مصمم الهوية (المالك)</div>
                  </button>

                  <button
                    onClick={() => {
                      switchUserDemo('member');
                      setIsProfileMenuOpen(false);
                    }}
                    className={`p-2 text-start rounded-lg text-xs font-medium border transition-colors ${
                      !isAdmin ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <UserIcon size={12} className={!isAdmin ? 'text-blue-400' : 'text-neutral-500'} />
                      <span>{t('مساعد إنتاج', 'Assistant')}</span>
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5 truncate">مساعد تطبيقات الهوية</div>
                  </button>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-0.5 pt-1 border-t border-neutral-100 text-xs">
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <UserPlus size={14} className="text-neutral-500" />
                  <span>{t('إضافة عضو جديد للاستوديو', 'Register Team Member')}</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalTab('forgot');
                    setIsAuthModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-start"
                >
                  <KeyRound size={14} className="text-neutral-500" />
                  <span>{t('إعادة تعيين كلمة المرور', 'Reset Password')}</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-start"
                >
                  <LogOut size={14} />
                  <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
