import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  ChevronRight,
  X,
  Building,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudio } from '../../context/StudioContext';
import { Invoice, PaymentRecord } from '../../types';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    clients,
    recordPayment,
    createInvoice,
    deleteInvoice,
    formatCurrency,
    formatDate,
    setPublicMode,
    setIsQuickCreateOpen,
    settings,
    showToast,
    t,
  } = useStudio();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذه الفاتورة نهائياً؟', 'Are you sure you want to delete this invoice?'))) {
      await deleteInvoice(id);
      setSelectedInvoice(invoices.filter((i) => i.id !== id)[0] || null);
    }
  };

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'credit_card' | 'stc_pay' | 'cash'>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const client = clients.find((c) => c.id === selectedInvoice?.clientId);

  const copyInvoiceLink = (inv: Invoice) => {
    const url = `${window.location.origin}/?view=invoice&token=${inv.shareToken}`;
    navigator.clipboard.writeText(url);
    showToast(t('تم نسخ رابط الفاتورة للمشاركة مع العميل', 'Invoice link copied to clipboard'));
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayRef(`TRX-${Date.now().toString().slice(-6)}`);
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await recordPayment(selectedInvoice.id, {
        amount: Number(payAmount),
        paymentDate: payDate,
        paymentMethod: payMethod,
        transactionReference: payRef,
        notes: payNotes,
      });

      if (res.success && res.invoice) {
        setSelectedInvoice(res.invoice);
        setIsPaymentModalOpen(false);
        if (res.invoice.status === 'paid') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('الفواتير وسجل المدفوعات', 'Invoices & Payments')}</h2>
          <p className="text-xs text-neutral-500">
            {t('إصدار فواتير العربون والدفعات المرحلية، التحقق المحاسبي من الأرصدة، ومنع تكرار الدفعات', 'Issue milestone invoices, manage payments, and enforce zero double-entry accounting')}
          </p>
        </div>

        <button
          onClick={() => setIsQuickCreateOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={15} />
          <span>{t('إصدار فاتورة جديدة', 'New Invoice')}</span>
        </button>
      </div>

      {/* Main Grid: List vs Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoices List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
            <span>{t('قائمة الفواتير', 'Invoices')}</span>
            <span className="font-mono text-neutral-400">({invoices.length})</span>
          </div>

          <div className="space-y-2">
            {invoices.map((inv) => {
              const c = clients.find((cl) => cl.id === inv.clientId);
              const isSelected = selectedInvoice?.id === inv.id;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0 ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800'
                          : inv.status === 'partially_paid'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {inv.status === 'paid' && t('مدفوعة بالكامل', 'Paid')}
                      {inv.status === 'partially_paid' && t('مدفوعة جزئياً', 'Partial')}
                      {inv.status === 'issued' && t('بانتظار السداد', 'Issued')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 leading-snug">{inv.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{c?.company || c?.name}</span>
                    <div className="text-end font-mono">
                      <div className="font-bold text-neutral-900 tabular-nums">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </div>
                      {inv.balanceDue > 0 && (
                        <div className="text-[10px] text-amber-700">
                          {t('المتبقي:', 'Due:')} {formatCurrency(inv.balanceDue, inv.currency)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyInvoiceLink(inv)}
                      className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                    >
                      <Copy size={12} />
                      <span>{t('نسخ الرابط', 'Copy Link')}</span>
                    </button>

                    <button
                      onClick={() => setPublicMode({ type: 'invoice', token: inv.shareToken })}
                      className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink size={12} />
                      <span>{t('معاينة الفاتورة', 'Client View')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Invoice Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {selectedInvoice ? (
            <div className="p-6 sm:p-8 bg-white border border-neutral-200/80 rounded-xl space-y-6 shadow-xs">
              {/* Invoice Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">{selectedInvoice.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyInvoiceLink(selectedInvoice)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <Copy size={13} />
                    <span>{t('نسخ الرابط', 'Copy')}</span>
                  </button>

                  <button
                    onClick={() => setPublicMode({ type: 'invoice', token: selectedInvoice.shareToken })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>{t('معاينة العميل', 'Client View')}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t('حذف الفاتورة', 'Delete Invoice')}
                  >
                    <Trash2 size={15} />
                  </button>

                  {selectedInvoice.balanceDue > 0 && (
                    <button
                      onClick={() => handleOpenPayment(selectedInvoice)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                    >
                      <CreditCard size={14} />
                      <span>{t('تسجيل دفعة يدوية', 'Record Payment')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between text-xs ${
                  selectedInvoice.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedInvoice.status === 'paid' ? (
                    <CheckCircle2 size={16} className="text-emerald-700" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-700" />
                  )}
                  <span className="font-semibold">
                    {selectedInvoice.status === 'paid'
                      ? t('تم سداد هذه الفاتورة بالكامل وتسويتها بالحساب البنكي', 'Invoice fully paid & settled')
                      : t('الفاتورة بانتظار سداد المتبقي من العميل', 'Invoice pending remaining balance settlement')}
                  </span>
                </div>
                <div className="font-mono text-xs">
                  {t('الرصيد المتبقي:', 'Balance Due:')}{' '}
                  <strong className="text-sm font-bold">{formatCurrency(selectedInvoice.balanceDue, selectedInvoice.currency)}</strong>
                </div>
              </div>

              {/* Parties Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                    {t('بيانات الاستوديو (المفوتر)', 'From (Studio)')}
                  </span>
                  <div className="font-bold text-neutral-900">{settings.studioName}</div>
                  <div className="text-neutral-500 font-mono">الرقم الضريبي: {settings.taxNumber}</div>
                  <div className="text-neutral-500 font-mono">السجل التجاري: {settings.crNumber}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                    {t('بيانات العميل (المرسل إليه)', 'Billed To (Client)')}
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
                      <th className="py-2.5 px-4 text-end">{t('المبلغ', 'Amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 font-medium text-neutral-900">{item.description}</td>
                        <td className="py-3 px-4 text-end font-mono font-bold tabular-nums">
                          {formatCurrency(item.amount, selectedInvoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary Calculation Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>{t('المجموع الفرعي الخاضع للضريبة:', 'Subtotal:')}</span>
                    <span className="font-mono font-semibold tabular-nums">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>{t('ضريبة القيمة المضافة (15%):', 'VAT (15%):')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>{t('إجمالي الفاتورة:', 'Total Amount:')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                    <span>{t('المبلغ المدفوع (المحصل):', 'Paid Amount:')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedInvoice.paidAmount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                    <span>{t('الرصيد المتبقي المستحق:', 'Balance Due:')}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedInvoice.balanceDue, selectedInvoice.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Verified Payments Ledger */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t('سجل الدفعات المقيدة على هذه الفاتورة', 'Recorded Payments Ledger')} ({selectedInvoice.payments.length})
                </h4>

                {selectedInvoice.payments.length > 0 ? (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-start">
                      <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                        <tr>
                          <th className="py-2 px-3 text-start">{t('التاريخ', 'Date')}</th>
                          <th className="py-2 px-3 text-start">{t('الوسيلة', 'Method')}</th>
                          <th className="py-2 px-3 text-start">{t('مرجع المعاملة', 'Reference')}</th>
                          <th className="py-2 px-3 text-start">{t('ملاحظات', 'Notes')}</th>
                          <th className="py-2 px-3 text-end">{t('المبلغ المسدد', 'Amount')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {selectedInvoice.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-3 font-mono text-neutral-700">{formatDate(p.paymentDate)}</td>
                            <td className="py-2.5 px-3 text-neutral-700">{p.paymentMethod}</td>
                            <td className="py-2.5 px-3 font-mono text-neutral-900 font-medium">{p.transactionReference}</td>
                            <td className="py-2.5 px-3 text-neutral-500 max-w-xs truncate">{p.notes || '-'}</td>
                            <td className="py-2.5 px-3 text-end font-mono font-bold text-emerald-800 tabular-nums">
                              {formatCurrency(p.amount, selectedInvoice.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500">
                    {t('لم يتم تسجيل أي دفعات مالية بعد على هذه الفاتورة', 'No payments recorded yet')}
                  </div>
                )}
              </div>

              {/* Bank Transfer Instructions */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-xs text-neutral-700 font-mono">
                <div className="font-bold text-neutral-900 font-sans">{t('تعليمات التحويل البنكي المعتمد:', 'Payment Instructions:')}</div>
                <div>{selectedInvoice.paymentInstructions}</div>
                <div>البنك: {settings.bankDetails.bankName} · الحساب: {settings.bankDetails.accountName}</div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-neutral-200/80 rounded-xl text-neutral-500 text-xs">
              {t('اختر فاتورة من القائمة لعرض تفاصيلها', 'Select an invoice to view')}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal with Math & Overpayment Rules */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">{t('تسجيل دفعة مالية مستلمة', 'Record Payment')}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg text-xs flex justify-between items-center">
              <span className="text-neutral-500">{t('الرصيد المتبقي المستحق:', 'Balance Due:')}</span>
              <span className="font-mono font-bold text-neutral-900">{formatCurrency(selectedInvoice.balanceDue, selectedInvoice.currency)}</span>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('قيمة الدفعة المستلمة (ر.س) *', 'Payment Amount *')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={selectedInvoice.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {t('لا يمكن أن يتجاوز مبلغ الدفعة الرصيد المتبقي.', 'Amount cannot exceed remaining balance.')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('تاريخ الاستلام', 'Date')}</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('وسيلة الدفع', 'Method')}</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="bank_transfer">{t('تحويل بنكي', 'Bank Transfer')}</option>
                    <option value="credit_card">{t('بطاقة مدى / ائتمان', 'Card')}</option>
                    <option value="stc_pay">stc pay</option>
                    <option value="cash">{t('نقدي', 'Cash')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('رقم مرجع المعاملة البنكية *', 'Transaction Reference *')}
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="TRX-ALRAJHI-123456"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('ملاحظات الإيصال', 'Receipt Notes')}</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="تم التحقق من كشف الحساب البنكي"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {t('تأكيد تسجيل الدفعة', 'Record Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
