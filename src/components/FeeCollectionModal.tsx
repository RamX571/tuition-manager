import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Calendar, IndianRupee, Tag, FileText } from 'lucide-react';
import type { StudentFeeSummary, PaymentMode, FeePayment } from '../types';
import {
  formatCurrency,
  formatDateISO,
  formatFriendlyDate,
  generateReceiptNumber
} from '../utils/feeCalculations';

interface FeeCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSummaries: StudentFeeSummary[];
  preSelectedSummary?: StudentFeeSummary | null;
  onPaymentRecorded: (payment: Omit<FeePayment, 'id' | 'createdAt'>) => Promise<FeePayment>;
}

export const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({
  isOpen,
  onClose,
  allSummaries,
  preSelectedSummary,
  onPaymentRecorded
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | string>(1500);
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [paymentDate, setPaymentDate] = useState<string>(formatDateISO(new Date()));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active summary
  const currentSummary = allSummaries.find(s => s.student.id === selectedStudentId);

  useEffect(() => {
    if (preSelectedSummary?.student.id) {
      setSelectedStudentId(preSelectedSummary.student.id);
      setAmount(preSelectedSummary.student.monthlyFee);
      setMonthsCount(1);
    } else if (allSummaries.length > 0 && selectedStudentId === '') {
      setSelectedStudentId(allSummaries[0].student.id || '');
      setAmount(allSummaries[0].student.monthlyFee);
    }
  }, [preSelectedSummary, allSummaries, isOpen]);

  // Update amount when student or months count changes
  const handleStudentChange = (id: number) => {
    setSelectedStudentId(id);
    const sum = allSummaries.find(s => s.student.id === id);
    if (sum) {
      setAmount(sum.student.monthlyFee * monthsCount);
    }
  };

  const handleMonthsChange = (months: number) => {
    setMonthsCount(months);
    if (currentSummary) {
      setAmount(currentSummary.student.monthlyFee * months);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSummary || !currentSummary.student.id) return;

    try {
      setIsSubmitting(true);
      const receiptNo = generateReceiptNumber();
      const cyclePeriod = currentSummary.nextCycleLabel;

      await onPaymentRecorded({
        studentId: currentSummary.student.id,
        amount: Number(amount),
        paymentDate,
        mode: paymentMode,
        monthsCount,
        cyclePeriod,
        receiptNumber: receiptNo,
        note: note.trim()
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Record Fee Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={e => handleStudentChange(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              {allSummaries.map(s => (
                <option key={s.student.id} value={s.student.id}>
                  {s.student.name} ({s.student.standard || 'No Class'}) -{' '}
                  {formatCurrency(s.student.monthlyFee)}/mo [
                  {s.status === 'OVERDUE' ? '⚠️ Overdue' : s.status === 'DUE_SOON' ? '⏰ Due Soon' : '✅ Paid'}
                  ]
                </option>
              ))}
            </select>
          </div>

          {/* Current Cycle Details Box */}
          {currentSummary && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatFriendlyDate(currentSummary.student.admissionDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Months Paid Till Now:</span>
                <span className="font-semibold text-slate-800">
                  {currentSummary.totalMonthsPaid} month(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cycle Due Date:</span>
                <span
                  className={`font-bold ${
                    currentSummary.status === 'OVERDUE'
                      ? 'text-rose-600'
                      : currentSummary.status === 'DUE_SOON'
                      ? 'text-amber-600'
                      : 'text-slate-800'
                  }`}
                >
                  {formatFriendlyDate(currentSummary.nextDueDate)}
                </span>
              </div>
            </div>
          )}

          {/* Number of Months & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Months
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleMonthsChange(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      monthsCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Mo{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-extrabold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Date & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Paid in full for upcoming month"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentSummary}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Check className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
