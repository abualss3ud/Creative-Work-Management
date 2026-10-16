import React, { useState } from 'react';
import {
  Library,
  Copy,
  Plus,
  FileQuestion,
  FileText,
  FileSignature,
  PackageCheck,
  Check,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const TemplatesLibraryView: React.FC = () => {
  const { createBriefForm, createProposal, showToast, t } = useStudio();

  const templates = [
    {
      id: 'tpl-1',
      type: 'brief',
      title: 'نموذج بريف الهوية البصرية الشامل (12 قسماً)',
      category: 'نماذج البريف',
      description: 'النموذج القياسي المعتمد لجمع قصة العلامة، الجمهور، المنافسين، والتفضيلات البصرية والتطبيقات.',
      badge: 'الأكثر استخداماً',
      action: async () => {
        await createBriefForm({ title: 'نموذج بريف شامل جديد' });
        showToast(t('تم استنساخ نموذج البريف إلى نماذجك بنجاح', 'Brief template cloned'));
      },
    },
    {
      id: 'tpl-2',
      type: 'proposal',
      title: 'قالب عرض سعر هوية بصرية فاخرة + دليل استخدام',
      category: 'عروض الأسعار',
      description: 'هيكل بنود احترافي يشمل الاستراتيجية، رسم الشعار، التايبوغرافي، وتطبيقات المطبوعات ونظام الدفعات 50/25/25.',
      badge: 'موصى به',
      action: async () => {
        await createProposal({ title: 'عرض سعر هوية فاخرة جديد' });
        showToast(t('تم استنساخ قالب عرض السعر بنجاح', 'Proposal template cloned'));
      },
    },
    {
      id: 'tpl-3',
      type: 'agreement',
      title: 'اتفاقية تقديم خدمات تصميم الهوية وحفظ الملكية الفكرية',
      category: 'الاتفاقيات',
      description: 'صيغة تعاقدية قانونية متوازنة توثق نطاق العمل وجولات التعديل المحددة وشروط انتقال حقوق الملكية بعد السداد.',
      badge: 'قانوني معتمد',
      action: () => {
        showToast(t('تم نسخ صيغة بنود الاتفاقية للاستخدام', 'Agreement clauses copied'));
      },
    },
    {
      id: 'tpl-4',
      type: 'deliverables',
      title: 'قائمة مراجعة تسليم أصول الهوية للمطابع (Print Checklist)',
      category: 'ملفات التسليم',
      description: 'قائمة تحقق من 18 بنداً تشمل تحويل الخطوط لمنحنيات (Outlines)، فحص هوامش الأمان، ونظام ألوان CMYK وPantone.',
      badge: 'فحص جودة',
      action: () => {
        showToast(t('تم تحميل قائمة فحص المطابع بنجاح', 'Print checklist loaded'));
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900">{t('مكتبة القوالب القابلة لإعادة الاستخدام', 'Templates Library')}</h2>
        <p className="text-xs text-neutral-500">
          {t('قوالب جاهزة للبريف، عروض الأسعار، العقود، وقوائم مراجعة التسليم لتسريع سير العمل دون البدء من الصفر', 'Standardized studio templates for briefs, proposals, agreements, and deliverables')}
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-neutral-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                  {tpl.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-700">
                  {tpl.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{tpl.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{tpl.description}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-400">قالب استوديو رسمي</span>
              <button
                onClick={tpl.action}
                className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Copy size={13} />
                <span>{t('استخدام القالب', 'Use Template')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
