import React, { useState } from 'react';
import {
  FileQuestion,
  CheckCircle2,
  Send,
  ArrowLeft,
  Building,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';

export const PublicBriefForm: React.FC = () => {
  const {
    briefForms,
    settings,
    setPublicMode,
    refreshData,
    showToast,
    t,
  } = useStudio();

  const form = briefForms[0];

  const [answers, setAnswers] = useState<Record<string, any>>({
    q1: 'متجر سكب للعود والعطور الطبيعية / Sakb Perfumes',
    q2: 'براند عطور شرقية وغربية معاصرة تستهدف فئة الشباب الباحثين عن التفرد والروائح الطبيعية غير التجارية.',
    q3: 'بدأت الفكرة من تجارب شخصية في تركيب الزيوت العطرية النقية.',
    q4: 'بناء حضور احترافي لدخول السوق لأول مرة',
    q5: 'الشباب والفتيات من 20-35 سنة من أصحاب الذوق العصري.',
    q6: '1. قصة للعطور (qissah.com)\n2. دار الطيب (daralteeb.com)',
    q7: ['حديثة ومينيمال (Modern & Minimal)', 'فاخرة ونخبوية (Luxury & High-end)'],
    q8: 'ألوان نيوترال هادئة، الأسود المطفي، زجاج سميك شفاف، وخط عربي حديث.',
    q9: ['تغليف وعلب المنتجات / الأكياس', 'المطبوعات الورقية والكروت والمنيو'],
    q10: '2026-12-15',
  });

  const [clientName, setClientName] = useState('سلطان الشمري');
  const [clientEmail, setClientEmail] = useState('sultan@sakbperfumes.com');
  const [clientCompany, setClientCompany] = useState('سكب للعطور');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !clientName || !clientEmail) return;
    setIsSubmitting(true);
    try {
      await api.submitBrief(form.id, {
        answers,
        clientName,
        clientEmail,
        clientCompany,
      });
      setIsSubmitted(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      await refreshData();
      showToast(t('تم إرسال إجابات البريف بنجاح للاستوديو', 'Brief submitted successfully'));
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال النموذج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckboxToggle = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    setAnswers((prev) => ({ ...prev, [qId]: updated }));
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 pb-16 font-sans">
      {/* Return to Studio Bar */}
      <div className="bg-neutral-900 text-white px-4 py-2.5 text-xs flex items-center justify-between">
        <span className="font-mono">
          {settings.studioName} · {t('نموذج جمع متطلبات الهوية البصرية (Brief)', 'Client Brief Questionnaire')}
        </span>
        <button
          onClick={() => setPublicMode({ type: null, token: null })}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{t('العودة للوحة تحكم الاستوديو', 'Back to Studio OS')}</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 space-y-8">
        {/* Intro Card */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-widest">
            <span>{settings.studioName}</span>
            <span aria-hidden="true">·</span>
            <span>Creative Intake</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
            {form?.title || 'نموذج بريف الهوية البصرية الشامل'}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {form?.description ||
              'نرحب بك في استوديو مدار. هذا النموذج مصمم لمساعدتنا على استكشاف علامتك التجارية بدقة، وفهم جمهورك ومنافسيك وتطلعاتك البصرية. يُرجى تعبئة الحقول بأكبر قدر ممكن من التفاصيل.'}
          </p>

          <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-500 flex items-center gap-2 font-mono">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>{t('يتم حفظ الإجابات وتحديثها مباشرة لدى فريق التصميم فور الإرسال.', 'Responses sync in real-time with the studio.')}</span>
          </div>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              {t('تم استلام إجابات البريف بنجاح!', 'Brief Received Successfully!')}
            </h2>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              {t(
                'شكراً لثقتكم ووقتكم. يقوم فريق الاستوديو حالياً بمراجعة كافة الإجابات وتجهيز دراسة السوق والمنافسين تمهيداً للانطلاق في مرحلة الاستراتيجية والمودبورد.',
                'Thank you! The creative director is reviewing your responses to formulate the research audit.'
              )}
            </p>
            <div className="pt-4">
              <button
                onClick={() => setPublicMode({ type: null, token: null })}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors"
              >
                {t('العودة للوحة التحكم', 'Return to Studio')}
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Identity Block */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t('معلومات العميل ونشاط العمل', 'Client & Contact Details')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('الاسم الكريم *', 'Your Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('البريد الإلكتروني *', 'Email *')}
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t('اسم الشركة أو النشاط', 'Company / Brand Name')}
                  </label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Questions Array */}
            <div className="space-y-4">
              {form?.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-neutral-400">0{idx + 1}.</span>
                        <h4 className="text-xs font-bold text-neutral-900">
                          {t(q.title, q.titleEn)}
                          {q.required && <span className="text-rose-600 ms-1">*</span>}
                        </h4>
                      </div>
                      {q.description && (
                        <p className="text-[11px] text-neutral-400 ms-6">{q.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="ms-6">
                    {/* SHORT TEXT */}
                    {q.type === 'short_text' && (
                      <input
                        type="text"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || ''}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                      />
                    )}

                    {/* LONG TEXT */}
                    {q.type === 'long_text' && (
                      <textarea
                        rows={3}
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || ''}
                        className="w-full p-3 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 leading-relaxed"
                      />
                    )}

                    {/* SINGLE CHOICE */}
                    {q.type === 'single_choice' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs transition-colors ${
                              answers[q.id] === opt
                                ? 'bg-neutral-50 border-neutral-900 font-semibold'
                                : 'border-neutral-200 hover:bg-neutral-50/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => handleAnswerChange(q.id, opt)}
                              className="accent-neutral-900"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* MULTIPLE CHOICE */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isChecked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer text-xs transition-colors ${
                                isChecked
                                  ? 'bg-neutral-50 border-neutral-900 font-semibold'
                                  : 'border-neutral-200 hover:bg-neutral-50/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxToggle(q.id, opt)}
                                className="accent-neutral-900 rounded"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* DATE */}
                    {q.type === 'date' && (
                      <input
                        type="date"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <div className="p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-xs flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                {t('تأكد من مراجعة الإجابات قبل الضغط على زر الإرسال.', 'Verify your responses before sending.')}
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
              >
                <Send size={14} />
                <span>{isSubmitting ? t('جارٍ الإرسال...', 'Submitting...') : t('إرسال إجابات البريف للاستوديو', 'Submit Brief')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
