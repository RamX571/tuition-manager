import React from 'react';
import { X, Printer, Share2, CheckCircle2, GraduationCap, Calendar, Receipt } from 'lucide-react';
import type { FeePayment, Student } from '../types';
import { formatCurrency, formatFriendlyDate } from '../utils/feeCalculations';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: FeePayment | null;
  student: Student | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  student
}) => {
  if (!isOpen || !payment || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden my-8">
        {/* Header Controls (Don't print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fee Receipt Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="receipt-paper" className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Institute Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              TUITION FEE RECEIPT
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Payment Acknowledgment
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 text-xs gap-y-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-2xs uppercase">Receipt No:</span>
              <span className="font-mono font-bold text-slate-900">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-2xs uppercase">Payment Date:</span>
              <span className="font-bold text-slate-900">{formatFriendlyDate(payment.paymentDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-2xs uppercase">Payment Mode:</span>
              <span className="font-bold uppercase text-slate-900">{payment.mode}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-2xs uppercase">Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Paid
              </span>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            {payment.cyclePeriod && (
              <div className="flex justify-between">
                <span className="text-slate-500">Period Covered:</span>
                <span className="font-medium text-slate-800">{payment.cyclePeriod}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Total Amount Received
            </span>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              {formatCurrency(payment.amount)}
            </div>
            <span className="text-2xs font-medium text-emerald-600/80 mt-1 block">
              Covered {payment.monthsCount} Month{payment.monthsCount > 1 ? 's' : ''} Tuition Fee
            </span>
          </div>

          {payment.note && (
            <p className="text-xs text-slate-500 italic text-center">
              "{payment.note}"
            </p>
          )}

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
            <div>
              <span>Generated digitally via Tuition Manager</span>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-slate-300 mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
