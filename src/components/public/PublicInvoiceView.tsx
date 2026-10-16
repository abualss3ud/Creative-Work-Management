import React from 'react';
import {
  Receipt,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PublicInvoiceView: React.FC = () => {
  const {
    invoices,
    clients,
    settings,
    setPublicMode,
    formatCurrency,
    formatDate,
    t,
  } = useStudio();

  const invoice = invoices[1] || invoices[0];
  const client = clients.find((c) => c.id === invoice?.clientId);

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 pb-16 font-sans">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white px-4 py-2.5 text-xs flex items-center justify-between no-print">
        <span className="font-mono">
          {settings.studioName} · {t('فاتورة رسمية ضريبية', 'Official Tax Invoice')}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            <Printer size={13} />
            <span>{t('طباعة / PDF', 'Print / PDF')}</span>
          </button>
          <button
            onClick={() => setPublicMode({ type: null, token: null })}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <ArrowLeft size={13} />
            <span>{t('العودة للاستوديو', 'Back to Studio')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 space-y-6">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                {settings.studioName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                {invoice?.title}
              </h1>
              <span className="text-xs font-mono text-neutral-500 block">
                {invoice?.invoiceNumber}
              </span>
            </div>

            <div className="text-end text-xs font-mono space-y-1">
              <div>
                <span className="text-neutral-400">{t('تاريخ الإصدار:', 'Issue Date:')} </span>
                <span className="text-neutral-900 font-bold">{formatDate(invoice?.issueDate || '')}</span>
              </div>
              <div>
                <span className="text-neutral-400">{t('تاريخ الاستحقاق:', 'Due Date:')} </span>
                <span className="text-neutral-900 font-bold">{formatDate(invoice?.dueDate || '')}</span>
              </div>
            </div>
          </div>

          {/* Parties Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                {t('الاستوديو (المفوتر)', 'From (Studio)')}
              </span>
              <div className="font-bold text-neutral-900">{settings.studioName}</div>
              <div className="text-neutral-500 font-mono">الرقم الضريبي: {settings.taxNumber}</div>
              <div className="text-neutral-500 font-mono">السجل التجاري: {settings.crNumber}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                {t('العميل', 'Billed To')}
              </span>
              <div className="font-bold text-neutral-900">{client?.company || client?.name}</div>
              <div className="text-neutral-500">{client?.name}</div>
              <div className="text-neutral-500 font-mono">{client?.email}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4 text-start">{t('الوصف / بند الخدمة', 'Description')}</th>
                  <th className="py-2.5 px-4 text-end">{t('المبلغ الخاضع للضريبة', 'Amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoice?.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-medium text-neutral-900">{item.description}</td>
                    <td className="py-3 px-4 text-end font-mono font-bold tabular-nums">
                      {formatCurrency(item.amount, invoice?.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t('المجموع قبل الضريبة:', 'Subtotal:')}</span>
                <span className="font-mono font-semibold tabular-nums">{formatCurrency(invoice?.subtotal || 0, invoice?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t('ضريبة القيمة المضافة (15%):', 'VAT (15%):')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice?.taxAmount || 0, invoice?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>{t('إجمالي الفاتورة:', 'Total:')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice?.totalAmount || 0, invoice?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>{t('المدفوع:', 'Paid:')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice?.paidAmount || 0, invoice?.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                <span>{t('الرصيد المتبقي المستحق:', 'Balance Due:')}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice?.balanceDue || 0, invoice?.currency)}</span>
              </div>
            </div>
          </div>

          {/* Banking Wire Instructions */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs font-mono">
            <div className="font-bold text-neutral-900 font-sans">{t('تعليمات التحويل البنكي المعتمد:', 'Bank Wire Details:')}</div>
            <div>البنك: {settings.bankDetails.bankName}</div>
            <div>المستفيد: {settings.bankDetails.accountName}</div>
            <div>الآيبان: {settings.bankDetails.iban}</div>
            {settings.bankDetails.swift && <div>السويفت: {settings.bankDetails.swift}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
