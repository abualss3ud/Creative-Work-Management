import React, { useState } from 'react';
import {
  Settings,
  Save,
  Building,
  CreditCard,
  FileText,
  Globe,
  Shield,
  Check,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { StudioSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, t } = useStudio();

  const [form, setForm] = useState<StudioSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('إعدادات وهوية الاستوديو', 'Studio Profile & Settings')}</h2>
          <p className="text-xs text-neutral-500">
            {t('تخصيص بيانات الاستوديو القانونية، الحساب البنكي، وشروط الدفع الافتراضية للفواتير وعروض الأسعار', 'Customize studio credentials, bank accounts, and default contract policies')}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Save size={14} />
          <span>{isSaving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ كافة الإعدادات', 'Save Settings')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Studio Branding & Identity */}
        <div className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Building size={15} />
            <span>{t('هوية وبيانات الاستوديو الأساسية', 'Studio Identity & Contact')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('اسم الاستوديو (عربي) *', 'Studio Name (Arabic) *')}
              </label>
              <input
                type="text"
                required
                value={form.studioName}
                onChange={(e) => setForm({ ...form, studioName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('اسم الاستوديو (إنجليزي)', 'Studio Name (English)')}
              </label>
              <input
                type="text"
                value={form.studioNameEn}
                onChange={(e) => setForm({ ...form, studioNameEn: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('اسم المصمم / المدير الإبداعي *', 'Owner / Creative Director *')}
              </label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('البريد الإلكتروني الرسمي *', 'Official Email *')}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('رقم الهاتف والتواصل', 'Phone')}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('العنوان / المقر', 'Address / City')}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Legal & Financial Parameters */}
        <div className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Shield size={15} />
            <span>{t('البيانات القانونية والضريبية', 'Legal & Tax Details')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('الرقم الضريبي (VAT Number)', 'Tax Number')}
              </label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('رقم السجل التجاري (CR Number)', 'CR Number')}
              </label>
              <input
                type="text"
                value={form.crNumber}
                onChange={(e) => setForm({ ...form, crNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('العملة الافتراضية', 'Default Currency')}
              </label>
              <select
                value={form.defaultCurrency}
                onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('نسبة الضريبة الافتراضية (%)', 'Default VAT %')}
              </label>
              <input
                type="number"
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('جولات التعديل الافتراضية', 'Default Revisions')}
              </label>
              <input
                type="number"
                value={form.defaultRevisionsCount}
                onChange={(e) => setForm({ ...form, defaultRevisionsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Details for Invoices */}
        <div className="p-6 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={15} />
            <span>{t('الحساب البنكي لتحصيل الفواتير والعربون', 'Banking & Wire Instructions')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('اسم البنك *', 'Bank Name *')}
              </label>
              <input
                type="text"
                required
                value={form.bankDetails.bankName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankDetails: { ...form.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('اسم صاحب الحساب الرسمي *', 'Account Beneficiary Name *')}
              </label>
              <input
                type="text"
                required
                value={form.bankDetails.accountName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankDetails: { ...form.bankDetails, accountName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('رقم الآيبان الدولي (IBAN) *', 'IBAN Number *')}
              </label>
              <input
                type="text"
                required
                value={form.bankDetails.iban}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankDetails: { ...form.bankDetails, iban: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('رمز السويفت (SWIFT / BIC)', 'SWIFT Code')}
              </label>
              <input
                type="text"
                value={form.bankDetails.swift || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankDetails: { ...form.bankDetails, swift: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
