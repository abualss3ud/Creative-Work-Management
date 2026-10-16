import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    forgotPassword,
    resetPassword,
    switchUserDemo,
    currentUser,
    t,
  } = useStudio();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('member');
  const [regTitle, setRegTitle] = useState('');

  // Forgot / Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!success) {
      setErrorMsg(t('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Invalid email or password'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const success = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      title: regTitle || (regRole === 'admin' ? 'مدير الاستوديو' : 'مصمم هويات بصرية'),
    });
    setIsSubmitting(false);
    if (!success) {
      setErrorMsg(t('فشل التسجيل، يرجى التحقق من صحة البيانات', 'Registration failed'));
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await forgotPassword(resetEmail);
    setIsSubmitting(false);
    if (res.success && res.token) {
      setGeneratedTokenPreview(res.token);
      setResetToken(res.token);
      setResetStep('confirm');
    } else {
      setErrorMsg(res.message || t('لم يتم العثور على الحساب', 'Account not found'));
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const success = await resetPassword(resetToken, newPassword);
    setIsSubmitting(false);
    if (success) {
      setResetStep('request');
      setGeneratedTokenPreview(null);
      setLoginPassword('');
    } else {
      setErrorMsg(t('رمز الاستعادة غير صالح أو منتهي الصلاحية', 'Invalid or expired token'));
    }
  };

  const handleQuickDemoLogin = (role: 'admin' | 'member') => {
    if (role === 'admin') {
      setLoginEmail('abualss3ud@gmail.com');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('assistant@brandflow.studio');
      setLoginPassword('designer123');
    }
    switchUserDemo(role);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-widest font-mono">
                BF
              </div>
              <h2 className="text-base font-bold text-neutral-900">
                {authModalTab === 'login' && t('تسجيل الدخول إلى الاستوديو', 'Sign in to BrandFlow')}
                {authModalTab === 'register' && t('إنشاء حساب عضو جديد', 'Create Team Account')}
                {(authModalTab === 'forgot' || authModalTab === 'reset') && t('استعادة كلمة المرور', 'Reset Password')}
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              {authModalTab === 'login' && t('إدارة مشاريع الهويات البصرية وعروض الأسعار', 'Manage visual identity workflows & clients')}
              {authModalTab === 'register' && t('إضافة عضو جديد بصلاحيات محددة', 'Assign role-based access for studio team')}
              {(authModalTab === 'forgot' || authModalTab === 'reset') && t('استعادة الوصول الآمن إلى حسابك', 'Secure account recovery')}
            </p>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 m-4 bg-neutral-100 rounded-xl text-xs font-medium text-neutral-600">
          <button
            onClick={() => {
              setAuthModalTab('login');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              authModalTab === 'login' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            {t('تسجيل الدخول', 'Sign In')}
          </button>
          <button
            onClick={() => {
              setAuthModalTab('register');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              authModalTab === 'register' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            {t('إنشاء حساب جديد', 'Register')}
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 pt-1 max-h-[75vh] overflow-y-auto space-y-4">
          {/* LOGIN FORM */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('البريد الإلكتروني', 'Email address')}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="designer@brandflow.studio"
                    className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700">
                    {t('كلمة المرور', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('forgot');
                      setResetStep('request');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-amber-800 hover:underline"
                  >
                    {t('نسيت كلمة المرور؟', 'Forgot password?')}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-9 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>{t('جاري الدخول...', 'Signing in...')}</span>
                ) : (
                  <>
                    <span>{t('تسجيل الدخول', 'Sign In')}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {/* 1-Click Quick Demo Login Switcher */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">
                  {t('تسجيل سريع للتجربة المباشرة', 'Quick Demo Access')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl text-start transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-amber-800">
                      <Shield size={13} className="text-amber-700" />
                      <span>{t('محمد أبو السعود', 'Mohamed Abu Al-Saud')}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                      مصمم واستراتيجي هويات (كامل الصلاحيات)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('member')}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl text-start transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-neutral-700">
                      <User size={13} className="text-neutral-500" />
                      <span>{t('مساعد تصميم', 'Assistant Designer')}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                      مساعد إنتاج الهوية (صلاحيات تصميم)
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('الاسم الكامل', 'Full Name')}
                </label>
                <div className="relative">
                  <User size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: فيصل العتيبي"
                    className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('البريد الإلكتروني', 'Email address')}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="faisal@brandflow.studio"
                    className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('المسمى الوظيفي', 'Job Title')}
                </label>
                <div className="relative">
                  <Briefcase size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="مثال: مصمم شعارات أول / Brand Strategist"
                    className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Role-based selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('مستوى الصلاحية والوصول (Role Authorization)', 'Role & Access Privileges')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-3 border rounded-xl text-start transition-all ${
                      regRole === 'admin'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Shield size={14} className={regRole === 'admin' ? 'text-amber-400' : 'text-neutral-500'} />
                      <span>{t('مدير نظام (Admin)', 'Administrator')}</span>
                    </div>
                    <div className={`text-[10px] mt-1 leading-relaxed ${regRole === 'admin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {t('صلاحيات كاملة: الإعدادات، الحسابات البنكية، التقارير والعملاء', 'Full access to financial, settings, and deletion')}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('member')}
                    className={`p-3 border rounded-xl text-start transition-all ${
                      regRole === 'member'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <User size={14} className={regRole === 'member' ? 'text-amber-400' : 'text-neutral-500'} />
                      <span>{t('عضو استوديو (Member)', 'Regular Member')}</span>
                    </div>
                    <div className={`text-[10px] mt-1 leading-relaxed ${regRole === 'member' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {t('إدارة وتطوير المشاريع، البريف، المودبورد، وعروض الأسعار', 'Create/edit projects, research, and proposals')}
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 block">
                  {t('كلمة المرور (6 أحرف على الأقل)', 'Password (min. 6 chars)')}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span>{t('جاري الحفظ والإنشاء...', 'Creating account...')}</span>
                ) : (
                  <>
                    <span>{t('تسجيل الحساب والدخول المباشر', 'Register & Enter Studio')}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT & RESET PASSWORD FLOW */}
          {(authModalTab === 'forgot' || authModalTab === 'reset') && (
            <div className="space-y-4">
              {resetStep === 'request' ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <KeyRound size={14} className="text-amber-700" />
                      <span>{t('استعادة كلمة المرور عبر الرمز الآمن', 'Password Recovery via Token')}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {t(
                        'أدخل البريد الإلكتروني المسجل، وسيقوم النظام بتوليد رمز استعادة آمن لتعيين كلمة مرور جديدة لحسابك.',
                        'Enter your registered email to receive a secure password reset token.'
                      )}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700 block">
                      {t('البريد الإلكتروني المسجل', 'Registered Email')}
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@brandflow.studio"
                        className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('login')}
                      className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                    >
                      {t('الرجوع لتسجيل الدخول', 'Back to Sign In')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <span>{t('إرسال طلب الاستعادة', 'Send Reset Request')}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {generatedTokenPreview && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-700" />
                        <span>{t('تم إنشاء رمز الاستعادة بنجاح', 'Reset Token Generated')}</span>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-1.5 rounded border border-emerald-200/80 break-all select-all">
                        {generatedTokenPreview}
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        {t('تمت تعبئة الرمز تلقائيًا بالأسفل لتسهيل العملية.', 'Token has been auto-filled below for instant verification.')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700 block">
                      {t('رمز الاستعادة (Reset Token)', 'Reset Token')}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="rst_..."
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700 block">
                      {t('كلمة المرور الجديدة (6 أحرف كحد أدنى)', 'New Password (min 6 chars)')}
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full ps-9 pe-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
                    >
                      {t('رجوع', 'Back')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <span>{t('تأكيد وحفظ كلمة المرور الجديدة', 'Save New Password')}</span>
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Role Comparison Accordion Box */}
          <div className="pt-2">
            <details className="text-xs text-neutral-500 border border-neutral-200/80 rounded-xl p-3 bg-neutral-50/60 cursor-pointer">
              <summary className="font-semibold text-neutral-800 hover:text-neutral-950 select-none flex items-center justify-between">
                <span>{t('جدول المقارنة بين صلاحيات الأدوار (RBAC)', 'Role Privileges Matrix (RBAC)')}</span>
                <span className="text-[10px] text-neutral-400 font-mono">▸</span>
              </summary>
              <div className="mt-2.5 pt-2 border-t border-neutral-200/60 space-y-2 text-[11px] leading-relaxed">
                <div>
                  <span className="font-bold text-neutral-900">{t('مدير الاستوديو (Administrator):', 'Administrator:')} </span>
                  {t('إدارة شاملة، تعديل الحسابات البنكية والسجل الضريبي، تغيير أدوار الفريق، حذف العملاء والمشاريع، واعتماد الاتفاقيات.', 'Full privileges including financials, team roles, and deletions.')}
                </div>
                <div>
                  <span className="font-bold text-neutral-900">{t('عضو الاستوديو (Regular Member):', 'Regular Member:')} </span>
                  {t('إدارة وتعديل مشاريع الهويات، إعداد المودبورد، إرسال البريف وعروض الأسعار، مع حجب الإعدادات المالية الحساسة.', 'Access to project workflow, briefs, and client deliverables.')}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
