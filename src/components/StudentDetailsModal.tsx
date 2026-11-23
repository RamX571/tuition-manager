import React from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Receipt,
  Edit2
} from 'lucide-react';
import type { StudentFeeSummary, FeePayment } from '../types';
import { formatCurrency, formatFriendlyDate } from '../utils/feeCalculations';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: StudentFeeSummary | null;
  payments: FeePayment[];
  onOpenCollectFee: (summary: StudentFeeSummary) => void;
  onOpenEditStudent: (summary: StudentFeeSummary) => void;
  onViewReceipt: (payment: FeePayment) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  summary,
  payments,
  onOpenCollectFee,
  onOpenEditStudent,
  onViewReceipt
}) => {
  if (!isOpen || !summary) return null;

  const { student, status, daysDifference, nextDueDate, nextCycleLabel, totalMonthsPaid, totalPaidAmount } = summary;

  // Filter payments for this student
  const studentPayments = payments
    .filter(p => p.studentId === student.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Paid / Up-to-date
    </span>
  );

  if (status === 'OVERDUE') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5" />
        {daysDifference} Days Overdue
      </span>
    );
  } else if (status === 'DUE_SOON') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        {daysDifference === 0 ? 'Due Today' : `Due in ${Math.abs(daysDifference)} days`}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                {statusBadge}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Admitted on {formatFriendlyDate(student.admissionDate)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Monthly Fee
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
                {formatCurrency(student.monthlyFee)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Months Paid
              </span>
              <span className="text-base sm:text-lg font-extrabold text-indigo-600 mt-0.5 block">
                {totalMonthsPaid} mo
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Fees Paid
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5 block">
                {formatCurrency(totalPaidAmount)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Next Fee Due
              </span>
              <span
                className={`text-base sm:text-lg font-extrabold mt-0.5 block ${
                  status === 'OVERDUE'
                    ? 'text-rose-600'
                    : status === 'DUE_SOON'
                    ? 'text-amber-600'
                    : 'text-slate-900'
                }`}
              >
                {formatFriendlyDate(nextDueDate)}
              </span>
            </div>
          </div>

          {/* Student Info Details */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Next Cycle Period:</span>
              <span className="font-medium text-slate-800">{nextCycleLabel}</span>
            </div>

            {student.notes && (
              <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                <span className="font-semibold text-slate-700">Notes:</span> {student.notes}
              </div>
            )}
          </div>

          {/* Payment History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Fee Payment Ledger ({studentPayments.length} records)
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCollectFee(summary);
                }}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Collect Fee
              </button>
            </div>

            {studentPayments.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Abhi tak koi payment record nahi hai.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Receipt #</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {formatFriendlyDate(p.paymentDate)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-2xs text-slate-500">
                          {p.receiptNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {p.cyclePeriod || `${p.monthsCount} month(s)`}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-2xs font-semibold text-slate-600">
                          {p.mode}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              onViewReceipt(p);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenEditStudent(summary);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Student Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
